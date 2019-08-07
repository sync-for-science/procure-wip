import SMART from "./smart-core";

export default class SmartPopup {

	constructor(provider) {
		this.provider = provider;
		this.authWindow = window.open('', '_blank');
		this.authWindow.document.write('Loading...');
	}

	parseQs(qs) {
		const pairs = qs.split('&');
		let result = {};
		pairs.forEach( pair => {
			pair = pair.split('=');
			result[pair[0]] = decodeURIComponent(pair[1]||"");
		});
		return result;
	}

	cancel() {
		if (this.reject) {
			clearInterval(this.popupPoll);
			window.removeEventListener("message", this.messageListener);
			this.authWindow.close();
			this.reject(new Error("cancelled"))
		}
	}

	authorize(authEndpoints, ignoreState) {	
		return new Promise( (resolve, reject) => {
			this.reject = reject;
			const stateParam = SMART.generateStateParam();

			this.popupPoll = setInterval( () => {   
				if (this.authWindow.closed) {
					clearInterval(this.popupPoll);
					window.removeEventListener("message", this.messageListener);
					reject(new Error("Login window closed by user"));
				}
			}, 500); 
	

			const receiveMessage = (event) => {
				if (event.origin !== window.location.origin) return;
				//block react dev tools messages
				if (typeof event.data !== "string") return;
				clearInterval(this.popupPoll);
				window.removeEventListener("message", this.messageListener);
				this.authWindow.close();

				const data = this.parseQs(event.data);

				if (data.error) {
					reject(data.error);
				} else if (data.code && ignoreState !== true && data.state !== stateParam) {
					reject("Invalid state parameter returned by server");
				} else if (data.code) {
					resolve( 
						SMART.exchangeCodeForToken(
							authEndpoints.tokenEndpoint,
							data.code,
							this.provider.redirectUri,
							this.provider.clientId,
							this.provider.clientSecret
						)
						.then( data => data.json() )
					);
				} else {
					reject("Failed to retrieve code parameter");
				}
			};
		
			const url = SMART.buildAuthorizeUrl(
				authEndpoints.authorizationEndpoint,
				this.provider.fhirEndpoint,
				stateParam,
				this.provider.scope,
				this.provider.redirectUri,
				this.provider.clientId
			);

			this.messageListener = 
				window.addEventListener("message", receiveMessage, false);
			
			this.authWindow.location.href = url;
		});
	}

}
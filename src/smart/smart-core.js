import fhir from "./fhir";

const authEndpointErr = "Authorization endpoint or token endpoint not found";

function getPath(obj, path = "") {
	path = path.trim();
	if (!path) return obj;
	return path.split(".").reduce(
		(out, key) => out ? out[key] : undefined,
		obj
	);
}

function getAuthEndpoints(fhirEndpoint) {
	const url = fhirEndpoint.replace(/\/*$/, "/");
	return new Promise( (resolve, reject) => {
		getWellKnownEndpoints(url)
			.then( endpoints => resolve(endpoints) )
			.catch( err => {
				getCapabilityEndpoints(url)
					.then( endpoints => resolve(endpoints) )
					.catch( err => reject( authEndpointErr ) )
			});
	});
}

function getWellKnownEndpoints(baseUrl) {
	const url = baseUrl + ".well-known/smart-configuration";
	return fetch(url)
		.then( response => {
			if (!response.ok)
				throw new Error(`HTTP ${response.status} - ${response.statusText}`);
			return response;
		})
		.then( data => data.json() )
		.then( json => {
			let endpoints = {
				registrationEndpoint  : json.registration_endpoint,
				authorizationEndpoint : json.authorization_endpoint,
				tokenEndpoint         : json.token_endpoint
			};
			if (!endpoints.authorizationEndpoint || !endpoints.tokenEndpoint) {
				throw authEndpointErr;
			} else {
				return endpoints;		
			}
		})
		.catch( e => { throw authEndpointErr });
}

function getCapabilityEndpoints(baseUrl) {
	const nsUri = "http://fhir-registry.smarthealthit.org/StructureDefinition/oauth-uris";
	const url = baseUrl + "metadata";

	return fhir.fetchFHIR(url)
		.then( json => {
			const extensions = (getPath(json || {}, "rest.0.security.extension") || [])
				.filter(e => e.url === nsUri)
				.map(o => o.extension)[0];

			let endpoints = {};
			if (extensions) {
				extensions.forEach(ext => {
					if (ext.url === "register")
						endpoints.registrationEndpoint = ext.valueUri;
					if (ext.url === "authorize")
						endpoints.authorizationEndpoint = ext.valueUri;
					if (ext.url === "token")
						endpoints.tokenEndpoint = ext.valueUri;
				});
			}
			if (!endpoints.authorizationEndpoint || !endpoints.tokenEndpoint) {
				throw authEndpointErr;
			} else{
				return endpoints;		
			}
		})
		.catch( e => { throw authEndpointErr });
}

function generateStateParam(targetLen=32) {
	const charSet = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
	let result = [];
	while (targetLen--)
		result.push(charSet.charAt(Math.floor(Math.random() * charSet.length)));
	return result.join("");
}

function buildAuthorizeUrl(authEndpoint, fhirEndpoint, state, scope, redirectUri, clientId, clientSecret, launch) {
	if (Array.isArray(scope)) scope = scope.join(" ");

	let params = [
		"response_type=code",
		"client_id="    + encodeURIComponent(clientId),
		"scope="        + encodeURIComponent(scope),
		"redirect_uri=" + encodeURIComponent(redirectUri),
		"aud="          + encodeURIComponent(fhirEndpoint),
		"state="        + state
	];

	if (launch) 
		params.push("launch=" + encodeURIComponent(launch));
	if (clientSecret) 
		params.push("client_secret=" + encodeURIComponent(clientSecret));

	return authEndpoint + "?" + params.join("&");
}

function exchangeCodeForToken(tokenEndpoint, code, redirectUri, clientId, clientSecret) {
	let config = {
		method: "post",
		headers:  {"content-type": "application/x-www-form-urlencoded"},
		// mode: "cors",
		body: [
			"grant_type=authorization_code",
			"code=" + encodeURIComponent(code),
			"redirect_uri=" + encodeURIComponent(redirectUri),
			"&client_id=" + encodeURIComponent(clientId)
		].join("&")
	}

	if (clientSecret) {
		config.auth = {username: clientId, password: clientSecret}
		config.body += "&client_id=" + encodeURIComponent(clientId) + "&client_secret=" + encodeURIComponent(clientSecret);
	}

	return fetch(tokenEndpoint, config)
		// .then( response => response.data )

}

function refreshToken(tokenEndpoint, refreshToken) {
	return fetch(tokenEndpoint, {
		method: "post",
		headers:  {"content-type": "application/x-www-form-urlencoded"},
		mode: "cors",
		body: [
			"grant_type=refresh_token",
			"refresh_token=" + encodeURIComponent(refreshToken)
		].join("&")
	})
}

function buildQs(fhirParams) {
	return "?" + Object.keys(fhirParams).map( k => {
		const value = Array.isArray(fhirParams[k]) ? fhirParams[k].join(",") : fhirParams[k];
		return k + "=" + encodeURIComponent(value);
	}).join("&");
}

export default {
	getWellKnownEndpoints, getCapabilityEndpoints, getAuthEndpoints, buildQs,
	buildAuthorizeUrl, exchangeCodeForToken, refreshToken, generateStateParam
}

const oauth_client_id = "921210788426-an4df7p4qmg29445983u2cg7khulg77t.apps.googleusercontent.com"

const base_url = "https://accounts.google.com/o/oauth2/auth";
const scope = "https://www.googleapis.com/auth/spreadsheets.readonly";
const access_type = "offline";
// TODO: 適当
const redirect_uri = "http://localhost:3000";
const response_type = "code";

const access_auth_url = `${base_url}?scope=${scope}&access_type=${access_type}&redirect_uri=${redirect_uri}&response_type=${response_type}&client_id=${oauth_client_id}`;

console.log(access_auth_url);



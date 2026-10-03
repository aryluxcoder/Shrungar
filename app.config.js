// Adds the Firebase config file to the static settings in app.json.
// google-services.json is not committed (public repo): locally it sits in the project root,
// and EAS builds get it from the GOOGLE_SERVICES_JSON file environment variable.
const fs = require('fs');

// Google sign-in needs the project's "web" OAuth client ID (client_type 3). Firebase adds it to
// google-services.json once Google sign-in is enabled and an Android SHA-1 is registered.
function googleWebClientId(file) {
  try {
    const services = JSON.parse(fs.readFileSync(file, 'utf8'));
    const clients = (services.client ?? []).flatMap((c) => [
      ...(c.oauth_client ?? []),
      ...(c.services?.appinvite_service?.other_platform_oauth_client ?? []),
    ]);
    return clients.find((c) => c.client_type === 3)?.client_id ?? null;
  } catch {
    return null;
  }
}

module.exports = ({ config }) => {
  const googleServicesFile =
    process.env.GOOGLE_SERVICES_JSON ?? (fs.existsSync('./google-services.json') ? './google-services.json' : undefined);

  return {
    ...config,
    android: { ...config.android, googleServicesFile },
    extra: {
      ...config.extra,
      googleWebClientId: googleServicesFile ? googleWebClientId(googleServicesFile) : null,
    },
  };
};

// Adds the Firebase config file to the static settings in app.json.
// google-services.json is not committed (public repo): locally it sits in the project root,
// and EAS builds get it from the GOOGLE_SERVICES_JSON file environment variable.
const fs = require('fs');

module.exports = ({ config }) => {
  const googleServicesFile =
    process.env.GOOGLE_SERVICES_JSON ?? (fs.existsSync('./google-services.json') ? './google-services.json' : undefined);

  return {
    ...config,
    android: { ...config.android, googleServicesFile },
  };
};

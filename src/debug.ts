import { GoogleSpreadsheet } from "google-spreadsheet";
import {JWT} from "google-auth-library";

const serviceAccountAuth = new JWT({
    email:"gbc-service-account@sincere-pixel-239713.iam.gserviceaccount.com",
    key: "-----BEGIN PRIVATE KEY-----\nMIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQDPAd32URWoW8j7\nxKEzn7kAot0ppWAVx2wwhbbdHjC9FHRBj+VlD7Iwiiscbkuu+F+yJxEI54F4UGXV\nLv6D+vw1IXCrJzvIgRG8dc/LbCsjF//dLLMqqQ75qdyzPuu3G5h2H8d9LssC8Rah\nnpWQK4OFFOHFX3IOaVceI8eh6K7JdVlHZ9ynbuALwZv62+GbGNgJ5uF2OxC0CAfl\nxNIJNyUDdt1FU0bwThvxZ1GjkBTsFF2zZuxM02knaG2B85mB6qD4QWYTf5bI7m0x\npSny834hdXxq1z40YuCEmx9VCXRlETXBF2cDZqzccjFXp6pdGuOUW4J1WfgFz2jN\n65/sd61FAgMBAAECggEANeNKCVelWC0Ano3a2wn+yowbH77FyxWdc+ozJs+3p1ke\nRHz1nf/ehqVJQL7zo8pTexiRZiyB9zSStdLkfa4GHrykTGHLvc/fspxGqjFv71RN\njqGWyIm29MZDxkOgcAvWfhWaxFs8jPj+x7b1P1EcjTXY6h0FH3xLqfRtgRgF/DpA\n0tgyJDxoylMRMDCOnlvMVTVpA6JxQXg5U5zM0pmrrnQdob5x4wn3Qc/sAmqtjG7J\nALqpQArzo9AsRjTZk4IqwmCpnh47ocUnRfZT7aFFMNTwDTJEfVfDcFN21OgC2gnG\nJcFN1CQKSWFA2siPxRrZVr0xG/PKhrxiW13RXnAz1wKBgQDqI7PmP2wsK671jmTq\nET/DYyWeqRPG+iiF2LcPPie/ybC2OK6ASjBHky9uOOkCZVBzo9mWLwJj6X2NhZxE\nK+dnbfB6dN9xa2Nqiyb0BF4jSbyTpiIs4qFvrp5P6Ko+Tv9VNxcE9FHuS/duO+SW\nnhgeYEoSRI7A/oZCwaJOUP4IrwKBgQDiVanJ/69B0MjSvvA2sKc60zhH1cRpUkDh\nmbhdtAMMmg8ymSF6AF5saAOgjCB9QDZYu6eBk50Pu/NpZlCowNUhsEIrjbOiXjbG\n2h4eGp8Q6M/ButJJtUSNzXGDNnW1QaTI72LoSm3wDa8mae0wZYBvH5uWgyUioNCn\nWJBX6ct+SwKBgQCm7l+DyDISZ+6siiIus6+XWWfn77n3AkHD89fIGVNzrJO9xzm6\no6o6TZjiZ9bQ63TpjadDKS72FvF55gmcnQS1vC9Yz1zDW4Ic4ysZjMelNxwo1KjH\nAamBm6ipZkOCewYWNlnGIX8Me8LkJ/V44Sxm89W7on94377Pd4iFd782ZwKBgAnE\nQIti6SEh7UiKzLrPbKfxLWCMLOmOjxYtF/OTLP6CN12rlfI5ydlLs7xdz5kYCEBT\n+KpywDhJl/tYWuqtR4UoofJXLwU2o455IwuRgoOsSCrH8QMVO1wTHW7YDsQ/jOjO\ny6nSbGQLcx9pOr734k7pQkGAbz3LSrWt8Kyafhl5AoGBALI6aNTkhrreHm/JhQVU\n2ZXKHsimxpdFYhuVKxLj01AikfqMJZF2Pw3VYqfgHj+qZ9SBzygffq6pekt2/v33\noUdIoe1m87DO8ZNCu5/Az65y4bA4tpYmVp9JBNeHP6ZC9L1sgzqbAVu1vgXX2kuC\nMVTEI0nkU9Fth54/u+5QU0tZ\n-----END PRIVATE KEY-----\n",
    scopes:['https://www.googleapis.com/auth/spreadsheets'],
});

const doc = new GoogleSpreadsheet("1_-ogjaupHCgw8_y2Ojs8ZS0hgPpYLzpZJ6x3glUdE6c",serviceAccountAuth);

(async () => {
    await doc.loadInfo();
    console.log(doc.title);
})();

import path from "path";
import { google } from "googleapis";
async function runSample() {
  // Obtain user credentials to use for the request
  const auth = new google.auth.GoogleAuth({
    keyFile: path.join(__dirname, '../credential.json'),
    scopes: ['https://www.googleapis.com/auth/drive.file','https://www.googleapis.com/auth/drive','https://www.googleapis.com/auth/drive.metadata.readonly'],
  });
  // google.options({auth});

  const service = google.drive({version:'v3',auth:auth});
  const res = await service.files.list({
    pageSize: 1,
    q: "'196WPHkI1H6TpBsyuhR3jaqDgrYmF9Io-' in parents and trashed = false",
    fields: 'nextPageToken, files(id, name,parents)',
  });
  console.log(res.data.files![0]);
  console.log(await service.about.get({fields:'user'}));
}
if (module === require.main) {
  runSample().catch(console.error);
}
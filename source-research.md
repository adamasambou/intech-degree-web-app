# Research resources

- https://community.articulate.com/discussions/articulate-storyline/storyline-2-example-generating-a-pdf-certificate-for-users-who-successfully-complete-a-quiz-html5
  https://gizmodo.com/how-qr-codes-work-and-why-they-suck-so-hard-5969312
- https://www.npr.org/2011/09/26/140805493/few-consumers-are-cracking-the-qr-code?t=1582823402203
- https://www.qrcode-monkey.com/
- http://qrcode.meetheed.com/technical.html
- https://en.wikipedia.org/wiki/Flowchart

## The OAUTH2 Manifesto
- https://tools.ietf.org/html/rfc6749


# Anatomy Of a HTTP Request
- https://medium.com/better-programming/the-anatomy-of-an-http-request-728a469ecba9
- https://www.webopedia.com/TERM/H/HTTP.html
# Libraries Used

- Http Client: Axios
- Xml Parser: xml2js
- Pdf Generator: pdfmake
- QR Library: qr.js Written by Kang Seonghoon
- Frontend: Vue.js with vuetify
- Mobile App: Flutter 1.9

# The M2sys localhost problem
The web app is being hosted at a firebase server, and therefore "localhost" in the fingerprint scanner context does not exist, a bridge must be built to allow communication of the web app hosted on firebase to the host computer with the fingerprint, in our case the standard url used for fingerscanning is located at http://localhost:15896
	a solution for this would be to use ngrok as a service and route the host fingerprint pc.
	Another solution would be to separate matters: make the verification process only available as a separate app from the university computer and a public facing website for students, and another for universities with the university panel.

# Scrypt
Scrypt as a hashing algorithm is an integral part of many crypto currencies, it's part of the BIP38 standard for encrypting private Bitcoin keys. It also serves as the proof-of-work system for many crypto currencies, most notably: Litecoin. Scrypt kdf algorithm protects against brute-force attacks to hashes; for this reason I have chosen to work with a javascript implementation of scrypt to protect the public information of the QR code, and once the fingerprint with the metadata gets encoded as a BASE64 string the next step is to concatenate the strings, normalize them to ANSII characters to ensure reusability and then, encode the result with scrypt, additionally, more metadata is appended to the beginning of the resultant string with the name of the student, the id and the word INTECHDEGREE to the front; this double salted hash is then used to create our unique decoding process, allowing our QR codes to be 100% unique and hard to reverse-engineer.

# QR Codes And Security
It's quite known that data on a QR code is not secure since any device can easily read the available information, however, in our case the fingerprint hash inside of the QR code itself has a salt added to it that only the mobile app can unsalt by using an algorithm that uses a nonce with an encription via scrypt, essentially rendering any public data as a base64 useless fingerprint that you can't verify agaisn't our backend, since the backend is secured and only accessible via Oauth2 with the mobile app itself, the only way an attacker can replicate our algorithm would be to decompile the binary bytecode produced by the APK on Dart and then getting all the API calls with functions, variables and sensitive information, at the time of the research of this project Dart can be decompiled and not obsfucated, therefore we need to add an extra security layer to the exported binary with manual code obsfucation and functions that do not do anything, the binary file is small but adding a couple of useless variable names, classes and methods will render the resultant code useless to a potential attacker, and then, the attacker would have to reverse engineer the algorithm, the API Calls and the M2SYS cloud service for it to be able to generate a fake degree, Good Luck trying.

# Firebase 20 character Unique Id Algorithm
- https://firebase.googleblog.com/2015/02/the-2120-ways-to-ensure-unique_68.html

# Body Formula of Intech Public Facing QR
## Server Data Encoding
The formula is simple string derivation as it follows the rule: 1ntech(**base64**) + firebaseid + fingerprint data since 1ntech as base64 equals to MW50ZWNoRGVncmVl

	let realKey = Buffer.from(qr.substring(34).normalize("NFKC"), "base64");

	let uid = qr.substring(16, 36); //16 characters word 1ntech zero based

## Server decodes
Server removes the word 1ntech, the firebase id and gets only the fingerprint data which is then used to do a key derivation verification function agaisnt the database fingerprint.
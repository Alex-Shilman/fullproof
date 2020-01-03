# FullProof
#to update the icon see:
https://www.christianengvall.se/electron-app-icons/

> FullProof is a desktop app that will load diag url and will prevent students from cheating.

#### To get started:

```
git clone https://github.cainc.com/ashilman/fullproof.git
cd fullproof
npm i
npm run start:dev
```


### App flow:

1. In the app display an iframe with a src to backend controller
2. In the controller generate a set of RSA256 pub/private keys
3. Share public key with the fullproof electron app
4. In the controller, read http cookies, create a JWT token with http cookies. Only valid for 5000 millseconds
5. create JWT cookie and embed cookies in the payload. Sign the cookie with RSA256 private key
6. Generate URL to the fullproof app with JWT as a query parameter
7. From controller, redirect request to the above url
8. FullProof app will start, parse query string and pull the token
9. Make sure the JWT token is valid
10. Pull http cookies from the token
11. Send the request to DIAG with cookies in the header.
12. When diag is finished, by clicking the 'x' button, it will kill FullProof app

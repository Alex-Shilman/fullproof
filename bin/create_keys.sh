#!/bin/bash

yes y | ssh-keygen -t rsa -b 2048 -m PEM -f ../keys/jwtRS256.key -q -N ""
openssl rsa -in ../keys/jwtRS256.key -pubout -outform PEM -out ../keys/jwtRS256.key.pub
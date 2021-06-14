#!/bin/bash

echo "Set the port number: "
read input_var
export PORT_NUM=$input_var
npm run start
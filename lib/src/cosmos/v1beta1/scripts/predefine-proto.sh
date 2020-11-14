#!/bin/bash

# Copyright © 2018–2020 IOV SAS (licensed under the Apache License, Version 2.0)
# Copyright © 2020 Confio UO (licensed under the Apache License, Version 2.0)
# Copyright © 2020 Simon Warta (licensed under the Apache License, Version 2.0)
# Modifications Copyright (c) 2018 - 2020, Foris Limited (licensed under the Apache License, Version 2.0)
set -o errexit -o nounset -o pipefail
command -v shellcheck > /dev/null && shellcheck "$0"

GENERATED_DIR="./tmp"
ROOT_PROTO_DIR="./proto/cosmos/cosmos-sdk"
COSMOS_PROTO_DIR="$ROOT_PROTO_DIR/proto/cosmos"
TENDERMINT_PROTO_DIR="$ROOT_PROTO_DIR/third_party/proto/tendermint"

mkdir -p "$GENERATED_DIR"
./node_modules/.bin/pbjs \
  -t static-module \
  --es6 \
  -w commonjs \
  -o "$GENERATED_DIR/codecimpl.js" \
  --sparse \
  --no-beautify \
  --no-delimited \
  --no-verify \
  --no-convert \
  --force-long \
  "$COSMOS_PROTO_DIR/bank/v1beta1/bank.proto" \
  "$COSMOS_PROTO_DIR/bank/v1beta1/tx.proto" \
  "$COSMOS_PROTO_DIR/distribution/v1beta1/distribution.proto" \
  "$COSMOS_PROTO_DIR/distribution/v1beta1/tx.proto" \
  "$COSMOS_PROTO_DIR/staking/v1beta1/staking.proto" \
  "$COSMOS_PROTO_DIR/staking/v1beta1/tx.proto" \
  "$COSMOS_PROTO_DIR/base/v1beta1/coin.proto" \
  "$COSMOS_PROTO_DIR/crypto/multisig/v1beta1/multisig.proto" \
  "$COSMOS_PROTO_DIR/crypto/secp256k1/keys.proto" \
  "$COSMOS_PROTO_DIR/crypto/ed25519/keys.proto" \
  "$COSMOS_PROTO_DIR/tx/v1beta1/tx.proto" \
  "$COSMOS_PROTO_DIR/tx/signing/v1beta1/signing.proto" \
  "$TENDERMINT_PROTO_DIR/types/types.proto" \
  "$TENDERMINT_PROTO_DIR/crypto/proof.proto" \
  "$TENDERMINT_PROTO_DIR/version/types.proto" \
  "$TENDERMINT_PROTO_DIR/types/validator.proto" \
  "$TENDERMINT_PROTO_DIR/crypto/keys.proto"

  # "$TENDERMINT_PROTO_DIR/protobuf/timestamp.proto" 


# Work around https://github.com/protobufjs/protobuf.js/issues/1477
# shellcheck disable=SC2016
sed -i "" -e 's/^const \$root =.*$/const \$root = {};/' "$GENERATED_DIR/codecimpl.js"

#!/bin/bash
echo $CLASPRC_JSON > ~/.clasprc.json
echo $CLASP_JSON > .clasp.json
echo $DEPLOY_JSON > .deploy.json

npx @google/clasp@1.6.0

# ライブラリ化やWebAppデプロイであればGASのデプロイ操作を実行する
if [ -e ./.deploy.json ]; then
  TARGET=`cat ./.deploy.json | jq -r '.target'`
  DESCRIPTION=`cat ./.deploy.json | jq -r '.description'`

  # Descriptionは必須のため指定がない場合は定型文に設定する
  if [ "$DESCRIPTION" = "" ]; then
    DESCRIPTION="CircleCI_Deployments."
  fi

  if [ "$TARGET" = "library" ]; then
    echo "Deloy Library."
    # clasp versionする
    CLASP=`npx @google/clasp@1.6.0 version "$DESCRIPTION"`
  fi

  if [ "$TARGET" = "webapp" ]; then
    echo "Deloy Webapp."
    DEPLOYMENTID=`cat ./.deploy.json | jq -r '.deploymentId'`

    # clasp versionし、作成したバージョン番号を取得する
    CLASP=`npx @google/clasp@1.6.0 version "$DESCRIPTION"`

    VERSION=`echo -n "$CLASP" | sed -E 's/.*Created version ([0-9]*)\.?(\r\n|\n|\r)?/\1/'`

    echo VERSION="$VERSION"
    echo DEPLOYMENT_ID="$DEPLOYMENTID"

    # WebAppのDeploymentIDを作成したバージョン番号で再deployする
    echo "npx @google/clasp@1.6.0 deploy -i ${DEPLOYMENTID} -V ${VERSION} -d "WebAPP""
    # npx @google/clasp@1.7.0 deploy -i ${DEPLOYMENTID} -V ${VERSION} -d "WebAPP"
    npx @google/clasp@1.6.0 redeploy $DEPLOYMENTID $VERSION "WebAPP"
  fi
fi
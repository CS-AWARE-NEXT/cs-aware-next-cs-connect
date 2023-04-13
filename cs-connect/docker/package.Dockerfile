FROM mattermost/mattermost-enterprise-edition:7.8.0
WORKDIR /mattermost
COPY docker/package/cs-aware-connect-+.tar.gz ./prepackaged_plugins/cs-aware-connect-+.tar.gz

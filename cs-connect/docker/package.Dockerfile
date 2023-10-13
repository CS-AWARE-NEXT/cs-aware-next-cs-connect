FROM mattermost/mattermost-enterprise-edition:7.8.0
WORKDIR /mattermost
COPY docker/package/cs-aware-connect-+.tar.gz ./prepackaged_plugins/cs-aware-connect-+.tar.gz
COPY docker/plugins/com.github.matterpoll.matterpoll.tar.gz ./prepackaged_plugins/com.github.matterpoll.matterpoll-1.6.1.tar.gz

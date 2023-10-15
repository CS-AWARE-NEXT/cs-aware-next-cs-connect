FROM cs-connect-base  AS BUILDER
WORKDIR home/mattermost/cs-connect
COPY . .
ARG CONFIG_FILE_NAME=config.yml
RUN make CONFIG_FILE_NAME=$CONFIG_FILE_NAME

FROM mattermost/mattermost-enterprise-edition:7.8.0
WORKDIR /mattermost
COPY --from=BUILDER /home/mattermost/cs-connect/dist/cs-aware-connect-+.tar.gz ./prepackaged_plugins/cs-aware-connect-+.tar.gz
COPY docker/plugins/com.github.matterpoll.matterpoll.tar.gz ./prepackaged_plugins/com.github.matterpoll.matterpoll-1.6.1.tar.gz

FROM cs-connect-base  AS BUILDER
WORKDIR home/mattermost/csa-connect
COPY . .
RUN make

FROM mattermost/mattermost-enterprise-edition:7.8.0
WORKDIR /mattermost
COPY --from=BUILDER /home/mattermost/csa-connect/dist/cs-aware-connect-+.tar.gz ./prepackaged_plugins/cs-aware-connect-+.tar.gz

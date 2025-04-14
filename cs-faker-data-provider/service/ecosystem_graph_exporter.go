package service

import (
	"bytes"
	"encoding/json"
	"errors"
	"io/ioutil"
	"net/http"
	"strings"

	"github.com/gofiber/fiber/v2/log"

	"github.com/CS-AWARE-NEXT/cs-aware-next-cs-connect/cs-faker-data-provider/model"
)

type EcosystemGraphExporter interface {
	ExportEcosystemGraph(
		graph *model.EcosystemGraphData,
		vars map[string]string,
	) (model.EcosystemGraphExport, error)
}

type JSONEcosystemGraphExporter struct {
	ecosystemId string
	endpoint    string
	authService *AuthService
}

// This is a way to implement interface explicitly
var _ EcosystemGraphExporter = (*JSONEcosystemGraphExporter)(nil)

func NewJSONEcosystemGraphExporter(
	ecosystemId string,
	endpoint string,
	authService *AuthService,
) *JSONEcosystemGraphExporter {
	return &JSONEcosystemGraphExporter{
		ecosystemId: ecosystemId,
		endpoint:    endpoint,
		authService: authService,
	}
}
func (ece *JSONEcosystemGraphExporter) ExportEcosystemGraph(
	graph *model.EcosystemGraphData,
	vars map[string]string,
) (model.EcosystemGraphExport, error) {
	log.Infof("Exporting ecosystem graph for ecosystem %s", ece.ecosystemId)

	log.Info("Creating request")
	graphExport := model.EcosystemGraphExport{
		EcosystemID: ece.ecosystemId,
		Nodes:       ece.mapNodeTypes(graph.Nodes),
		Edges:       graph.Edges,
	}
	body, err := json.Marshal(graphExport)
	if err != nil {
		log.Error("error creating body ", err.Error())
		return model.EcosystemGraphExport{}, err
	}
	log.Infof("Exporting ecosystem graph -----> %s", string(body))

	endpoint := strings.Replace(ece.endpoint, "{ecosystem_id}", ece.ecosystemId, 1)
	log.Infof("Endpoint for ecosystem graph export: %s", endpoint)
	req, err := http.NewRequest(
		"PUT",
		endpoint,
		bytes.NewBuffer(body),
	)
	if err != nil {
		log.Error("error creating request ", err.Error())
		return model.EcosystemGraphExport{}, err
	}
	req.Header.Set("Content-Type", "application/json")

	log.Info("Authenticating to get token")
	authResp, err := ece.authService.Auth(vars["authUsername"], vars["authPassword"])
	if err != nil {
		log.Error("error authenticating ", err.Error())
		return model.EcosystemGraphExport{}, err
	}
	log.Infof("Got token: %s", authResp.String())
	req.Header.Set("access-token", authResp.AccessToken)
	req.Header.Set("id-token", authResp.IdToken)

	transport := &http.Transport{}
	client := &http.Client{Transport: transport}

	resp, err := client.Do(req)
	if err != nil {
		log.Error("error exporting ecosystem graph ", err.Error())
		return model.EcosystemGraphExport{}, err
	}
	defer resp.Body.Close()
	defer transport.CloseIdleConnections()

	log.Info("Response Status: ", resp.Status)
	log.Info("Response Headers: ", resp.Header)
	if resp.StatusCode != http.StatusOK {
		log.Error("error exporting ecosystem graph on status check ", resp.Status)

		respBody, _ := ioutil.ReadAll(resp.Body)
		log.Error("body of error exporting ecosystem graph on status check ", string(respBody))

		return model.EcosystemGraphExport{}, errors.New("external server returned error when trying to export the ecosystem graph")
	}
	respBody, err := ioutil.ReadAll(resp.Body)
	if err != nil {
		log.Error("error reading response body ", string(respBody), err.Error())
		return model.EcosystemGraphExport{}, err
	}
	log.Info("Response Body: ", string(respBody))

	log.Infof("Exported ecosystem graph for ecosystem %s", graphExport.EcosystemID)

	return graphExport, nil
}

func (ece *JSONEcosystemGraphExporter) mapNodeTypes(
	nodes []*model.EcosystemGraphNode,
) []*model.EcosystemGraphNode {
	for _, node := range nodes {
		switch node.Type {
		case "rectangle":
			node.Type = "organization"
		case "oval":
			node.Type = "service"
		default:
			node.Type = "unknown"
		}
	}
	return nodes
}

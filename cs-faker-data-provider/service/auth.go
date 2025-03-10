package service

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io/ioutil"
	"net/http"

	"github.com/gofiber/fiber/v2/log"
)

type AuthResponse struct {
	AccessToken string `json:"access_token"`
	IdToken     string `json:"id_token"`
}

func (ar AuthResponse) String() string {
	// TODO: we need a env var to differentiate between dev and prod
	// return fmt.Sprintf("AccessToken: %s, IdToken: %s", ar.AccessToken, ar.IdToken)
	return fmt.Sprintf("AccessToken: %s, IdToken: %s", "<hidden>", "<hidden>")
}

type AuthService struct {
	endpoint string
}

func NewAuthService(endpoint string) *AuthService {
	return &AuthService{
		endpoint: endpoint,
	}
}

func (ac *AuthService) Auth(username, password string) (AuthResponse, error) {
	log.Infof("Authenticating user [%s] at %s", username, ac.endpoint)
	queryString := fmt.Sprintf("email=%s&password=%s", username, password)
	req, err := http.NewRequest(
		"POST",
		ac.endpoint+"?"+queryString,
		nil,
	)
	if err != nil {
		log.Error("error creating request ", err.Error())
		return AuthResponse{}, err
	}
	req.Header.Set("Content-Type", "application/json")

	transport := &http.Transport{}
	client := &http.Client{Transport: transport}

	resp, err := client.Do(req)
	if err != nil {
		log.Error("error requesting news posts ", err.Error())
		return AuthResponse{}, err
	}
	defer resp.Body.Close()
	defer transport.CloseIdleConnections()

	log.Info("Response Status: ", resp.Status)
	log.Info("Response Headers: ", resp.Header)
	respBody, err := ioutil.ReadAll(resp.Body)
	if err != nil {
		log.Error("error reading response body ", string(respBody), err.Error())
		return AuthResponse{}, err
	}

	// This logs the access token and id token, so it is commented out
	// now that things have been tested for a long time
	// log.Info("Auth response Body: ", string(respBody))

	log.Info("unmarshaling auth response")
	var response AuthResponse
	err = json.NewDecoder(bytes.NewReader(respBody)).Decode(&response)
	if err != nil {
		log.Error("error unmarshaling news posts ", err.Error())
		return AuthResponse{}, err
	}
	log.Info("unmarshalled auth response successfully")

	return response, nil
}

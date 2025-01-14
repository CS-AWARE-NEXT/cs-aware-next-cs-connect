package app

import (
	"encoding/json"
	"fmt"
	"net/http"

	"github.com/sirupsen/logrus"
)

type JSON struct{}

func (e *JSON) FileName(name string) string {
	return fmt.Sprintf("%s.json", name)
}

func (e *JSON) ContentType() string {
	return "application/json"
}

func (e *JSON) Export(w http.ResponseWriter, stixChannel *STIXChannel, download bool) {
	fileName := e.FileName(stixChannel.Name)

	jsonBytes, err := json.Marshal(stixChannel)
	if err != nil {
		logrus.WithError(err).Error("Unable to marshal JSON")
		return
	}

	w.Header().Set("Content-Type", "application/json")
	if download {
		logrus.Infof("JSON export is for downloading %s", fileName)
		w.Header().Set("Content-Disposition", "attachment; filename="+fileName)
	}
	w.WriteHeader(http.StatusOK)

	if _, err = w.Write(jsonBytes); err != nil {
		logrus.WithError(err).Warn("Unable to write to http.ResponseWriter")
		return
	}
}

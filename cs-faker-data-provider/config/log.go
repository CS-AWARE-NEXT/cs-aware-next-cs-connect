package config

import (
	"errors"
	"fmt"
	"os"
)

func UseLogFile(dirName string, fileName string) (*os.File, error) {
	path := fmt.Sprintf("%s/%s", dirName, fileName)
	err := createLogDirIfDoesNotExist(dirName)
	if err != nil {
		return nil, err
	}
	logFile, err := os.OpenFile(path, os.O_CREATE|os.O_APPEND|os.O_WRONLY, 0644)
	if err != nil {
		return nil, err
	}
	return logFile, nil
}

func createLogDirIfDoesNotExist(dirName string) error {
	if existsDir(dirName) {
		return nil
	}
	err := os.Mkdir(dirName, os.ModePerm)
	if err != nil {
		return err
	}
	return nil
}

func existsDir(dirName string) bool {
	_, err := os.Stat(dirName)
	return !errors.Is(err, os.ErrNotExist)
}

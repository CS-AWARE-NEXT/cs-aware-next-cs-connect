package util

import (
	"bytes"
	"encoding/csv"
	"io/fs"
	"log"
	"strings"

	"github.com/CS-AWARE-NEXT/cs-aware-next-cs-connect/cs-faker-data-provider/data"
)

func GetEmbeddedFilePath(fileName, extension string) (string, error) {
	filePaths, err := fs.Glob(data.Data, extension)
	if err != nil {
		return "", err
	}
	for _, filePath := range filePaths {
		if strings.Contains(filePath, fileName) {
			return filePath, nil
		}
	}
	return "", err
}

func GetCSVRows(fileName, extension string, separator rune) (records [][]string, err error) {
	if separator == 0 {
		separator = ','
		log.Printf("Using default separator: %d", separator)
	}

	filePath, err := GetEmbeddedFilePath(fileName, extension)
	if err != nil {
		log.Printf("Failed GetEmbeddedFilePath(%s, %s) with error: %v", fileName, extension, err)
		return records, err
	}
	content, err := data.Data.ReadFile(filePath)
	if err != nil {
		log.Printf("Failed ReadFile(%s) with error: %v", filePath, err)
		return records, err
	}
	bytesReader := bytes.NewReader(content)
	reader := csv.NewReader(bytesReader)
	reader.Comma = separator

	rows, err := reader.ReadAll()
	if err != nil {
		log.Printf("Failed ReadAll with error: %v", err)
		return records, err
	}
	return rows, nil
}

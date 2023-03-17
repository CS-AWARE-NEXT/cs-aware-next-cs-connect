package util

import (
	"html/template"
	"strings"
)

func BuildStringFromTemplate(templateName string, templateString string, placeholder interface{}) (string, error) {
	tmpl, err := template.New(templateName).Parse(templateString)
	if err != nil {
		return "", nil
	}
	var buffer strings.Builder
	err = tmpl.Execute(&buffer, placeholder)
	if err != nil {
		return "", nil
	}

	return buffer.String(), nil
}

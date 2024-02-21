package controller

import (
	"encoding/json"
	"fmt"

	"github.com/CS-AWARE-NEXT/cs-aware-next-cs-connect/cs-faker-data-provider/data"
	"github.com/CS-AWARE-NEXT/cs-aware-next-cs-connect/cs-faker-data-provider/model"
	"github.com/CS-AWARE-NEXT/cs-aware-next-cs-connect/cs-faker-data-provider/util"
	"github.com/gofiber/fiber/v2"
)

type BundleController struct{}

func NewBundleController() *BundleController {
	return &BundleController{}
}

func (bc *BundleController) GetBundles(c *fiber.Ctx) error {
	organizationId := c.Params("organizationId")

	tableData := model.PaginatedTableData{
		Columns: bundlePaginatedTableData.Columns,
		Rows:    []model.PaginatedTableRow{},
	}
	for _, bundle := range bundleMap[organizationId] {
		tableData.Rows = append(tableData.Rows, model.PaginatedTableRow{
			ID:          bundle.ID,
			Name:        bundle.Name,
			Description: bundle.Description,
		})
	}
	return c.JSON(tableData)
}

func (bc *BundleController) GetBundle(c *fiber.Ctx) error {
	return c.JSON(bc.getBundleByID(c))
}

func (bc *BundleController) GetBundleContent(c *fiber.Ctx) error {
	organizationId := c.Params("organizationId")
	organizationName := ""
	if organizationId == "4" {
		organizationName = "demo"
	}

	fileName := "bundle.json"
	if organizationName != "" {
		fileName = fmt.Sprintf("%s-%s", organizationName, fileName)
	}

	if bundle, err := bc.getBundleFromFile(fileName); err == nil {
		return c.JSON(bundle)
	}
	return c.JSON(model.Bundle{})
}

func (bc *BundleController) getBundleFromFile(fileName string) (model.STIXBundle, error) {
	filePath, err := util.GetEmbeddedFilePath(fileName, "*.json")
	if err != nil {
		return model.STIXBundle{}, err
	}
	content, err := data.Data.ReadFile(filePath)
	if err != nil {
		return model.STIXBundle{}, err
	}
	var bundle model.STIXBundle
	err = json.Unmarshal(content, &bundle)
	if err != nil {
		return model.STIXBundle{}, err
	}
	return bundle, nil
}

func (bc *BundleController) getBundleByID(c *fiber.Ctx) model.Bundle {
	organizationId := c.Params("organizationId")
	bundleId := c.Params("bundleId")
	for _, bundle := range bundleMap[organizationId] {
		if bundle.ID == bundleId {
			return bundle
		}
	}
	return model.Bundle{}
}

var bundleMap = map[string][]model.Bundle{
	"4": {
		{
			ID:          "e95ef29c-1ee8-45e5-a14b-019846e4dece",
			Name:        "Malicious Site Hosting Downloader",
			Description: "A group performing malicious site hosting with download links to malware",
		},
	},
}

var bundlePaginatedTableData = model.PaginatedTableData{
	Columns: []model.PaginatedTableColumn{
		{
			Title: "Name",
		},
		{
			Title: "Description",
		},
	},
	Rows: []model.PaginatedTableRow{},
}

package controller

import (
	"encoding/json"
	"fmt"
	"log"
	"strings"

	"github.com/CS-AWARE-NEXT/cs-aware-next-cs-connect/cs-faker-data-provider/data"
	"github.com/CS-AWARE-NEXT/cs-aware-next-cs-connect/cs-faker-data-provider/model"
	"github.com/CS-AWARE-NEXT/cs-aware-next-cs-connect/cs-faker-data-provider/util"
	"github.com/gofiber/fiber/v2"
	"github.com/xuri/excelize/v2"
	"golang.org/x/text/cases"
	"golang.org/x/text/language"
)

type ExerciseController struct{}

func NewExerciseController() *ExerciseController {
	return &ExerciseController{}
}

func (ec *ExerciseController) GetExercises(c *fiber.Ctx) error {
	organizationId := c.Params("organizationId")

	tableData := model.PaginatedTableData{
		Columns: socialMediaPaginatedTableData.Columns,
		Rows:    []model.PaginatedTableRow{},
	}
	for _, exercise := range exerciseMap[organizationId] {
		tableData.Rows = append(tableData.Rows, model.PaginatedTableRow{
			ID:          exercise.ID,
			Name:        exercise.Name,
			Description: exercise.Description,
		})
	}
	return c.JSON(tableData)
}

func (ec *ExerciseController) GetExercise(c *fiber.Ctx) error {
	return c.JSON(ec.getExerciseByID(c))
}

func (ec *ExerciseController) GetExerciseAssignment(c *fiber.Ctx) error {
	// organizationId := c.Params("organizationId")
	exerciseId := c.Params("exerciseId")
	organizationName := "foggia"
	filePath, err := util.GetEmbeddedFilePath(fmt.Sprintf("%s-exercise-%s", organizationName, exerciseId), "*.xlsx")
	if err != nil {
		return c.JSON(model.ExerciseAssignment{})
	}
	file, err := data.Data.Open(filePath)
	if err != nil {
		return c.JSON(model.ExerciseAssignment{})
	}
	excel, err := excelize.OpenReader(file)
	if err != nil {
		return c.JSON(model.ExerciseAssignment{})
	}

	caser := cases.Title(language.English)
	assignment := model.Assignment{}
	rows, err := excel.GetRows(excel.GetSheetName(0))
	if err != nil {
		return c.JSON(model.ExerciseAssignment{})
	}
	for index, row := range rows {
		if index >= 1 {
			break
		}
		for index, col := range row {
			if index == 0 && strings.Contains(strings.ToLower(col), "course") {
				ec.ParseCourseIntoAssignment(&assignment, rows)
				return c.JSON(model.ExerciseAssignment{
					Assignment: assignment,
					Incidents:  []model.IncidentWithOrganizationId{},
				})
			}

			if col == "" || index == 0 || strings.Contains(col, "Assignment:") {
				continue
			}

			if index == 1 {
				assignment.DescriptionName = caser.String(col)
				continue
			}
			// if strings.Contains(col, "Attack phases") {
			// 	col = strings.Trim(col, " ")
			// 	col = strings.Trim(col, ":")
			// 	assignment.AttackName = caser.String(col)
			// 	continue
			// }
			if strings.Contains(strings.ToLower(col), "assignment") {
				assignment.QuestionName = caser.String(col)
				continue
			}
			if strings.Contains(strings.ToLower(col), "material") {
				assignment.EducationName = caser.String(col)
				continue
			}

			if assignment.EducationName != "" {
				assignment.EducationMaterial = append(assignment.EducationMaterial, col)
				continue
			}
			if assignment.QuestionName != "" {
				assignment.Questions = append(assignment.Questions, col)
				continue
			}
			// if assignment.AttackName != "" {
			// 	assignment.AttackParts = append(assignment.AttackParts, col)
			// 	continue
			// }
			if assignment.DescriptionName != "" {
				assignment.DescriptionParts = append(assignment.DescriptionParts, col)
			}
		}
	}

	incidents := []model.IncidentWithOrganizationId{}

	// for _, incident := range GetIncidentsByOrganizationId(organizationId) {
	// 	incidents = append(incidents, model.IncidentWithOrganizationId{
	// 		Incident:       incident,
	// 		OrganizationId: organizationId,
	// 	})
	// }

	return c.JSON(model.ExerciseAssignment{
		Assignment: assignment,
		Incidents:  incidents,
	})
}

func (ec *ExerciseController) ParseCourseIntoAssignment(assignment *model.Assignment, rows [][]string) {
	caser := cases.Title(language.Italian)
	for index, row := range rows {
		if index >= 1 {
			break
		}
		for index, col := range row {
			if col == "" || index == 0 {
				continue
			}

			if index == 1 {
				assignment.DescriptionName = caser.String(col)
				continue
			}
			if strings.Contains(strings.ToLower(col), "processo di registrazione") {
				assignment.RegistrationAccessProcessName = caser.String(col)
				continue
			}
			if strings.Contains(strings.ToLower(col), "domande riflessive") {
				assignment.QuestionName = caser.String(col)
				continue
			}
			if strings.Contains(strings.ToLower(col), "domanda aperta") {
				assignment.OpenQuestionName = caser.String(col)
				continue
			}
			if col == "Link ai materiali didattici" {
				assignment.InstructionName = caser.String(col)
				continue
			}

			log.Printf("\n### col: %+v\n ##### assignment: %+v\n", col[:40], assignment)

			if assignment.OpenQuestionName != "" {
				assignment.OpenQuestions = append(assignment.OpenQuestions, col)
				continue
			}
			if assignment.QuestionName != "" {
				assignment.Questions = append(assignment.Questions, col)
				continue
			}
			if assignment.InstructionName != "" {
				assignment.Instructions = append(assignment.Instructions, col)
				continue
			}
			if assignment.RegistrationAccessProcessName != "" {
				assignment.RegistrationAccessProcess = append(assignment.RegistrationAccessProcess, col)
				continue
			}
			if assignment.DescriptionName != "" {
				assignment.DescriptionParts = append(assignment.DescriptionParts, col)
			}
		}
	}
}

func (ec *ExerciseController) getExerciseFromFile(fileName string) (model.SocialMediaPostEntityData, error) {
	filePath, err := util.GetEmbeddedFilePath(fileName, "*.json")
	if err != nil {
		return model.SocialMediaPostEntityData{}, err
	}
	content, err := data.Data.ReadFile(filePath)
	if err != nil {
		return model.SocialMediaPostEntityData{}, err
	}
	var socialMediaPostEntityData model.SocialMediaPostEntityData
	err = json.Unmarshal(content, &socialMediaPostEntityData)
	if err != nil {
		return model.SocialMediaPostEntityData{}, err
	}
	return socialMediaPostEntityData, nil
}

func (ec *ExerciseController) getExerciseByID(c *fiber.Ctx) model.Exercise {
	organizationId := c.Params("organizationId")
	exerciseId := c.Params("exerciseId")
	for _, exercise := range exerciseMap[organizationId] {
		if exercise.ID == exerciseId {
			return exercise
		}
	}
	return model.Exercise{}
}

var exerciseMap = map[string][]model.Exercise{
	"5": {
		{
			ID:          "ccc12c9a-8b99-48d8-b97e-5e1eec042b4f",
			Name:        "Attacking Obsolete Operating System",
			Description: "Exercise about an attack leveraging an obsolete operating system.",
		},
		{
			ID:          "80ab809d-0539-4980-9f9c-0d46252761b1",
			Name:        "Concetti di base",
			Description: "Questo canale ti supporta nell&#39;apprendimento degli argomenti di base della sicurezza informatica offrendo materiale didattico sviluppato dalla Austrian Computer Society (OCG).",
		},
	},
}

var exercisePaginatedTableData = model.PaginatedTableData{
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

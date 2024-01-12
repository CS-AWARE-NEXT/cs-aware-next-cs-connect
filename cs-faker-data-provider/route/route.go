package route

import (
	"log"

	"github.com/gofiber/fiber/v2"

	"github.com/CS-AWARE-NEXT/cs-aware-next-cs-connect/cs-faker-data-provider/config"
	"github.com/CS-AWARE-NEXT/cs-aware-next-cs-connect/cs-faker-data-provider/controller"
	"github.com/CS-AWARE-NEXT/cs-aware-next-cs-connect/cs-faker-data-provider/repository"
)

func UseRoutes(app *fiber.App, context *config.Context) {
	basePath := app.Group("/cs-data-provider")
	useOrganizations(basePath)
	useEcosystem(basePath, context)
}

// TODO: /organizations base routes are not used since config file was introduced
// They were used for the slash command
func useOrganizations(basePath fiber.Router) {
	organizationController := controller.NewOrganizationController()

	organizations := basePath.Group("/organizations")
	organizations.Get("/", func(c *fiber.Ctx) error {
		log.Printf("GET /organizations called")
		return organizationController.GetOrganizations(c)
	})
	organizations.Get("/no_page", func(c *fiber.Ctx) error {
		log.Printf("GET /organizations/no_page called")
		return organizationController.GetOrganizationsNoPage(c)
	})
	organizations.Get("/:organizationId", func(c *fiber.Ctx) error {
		log.Printf("GET /organizations/:organizationId called")
		return organizationController.GetOrganization(c)
	})
	useOrganizationsIncidents(organizations)
	useOrganizationsStories(organizations)
	useOrganizationsPolicies(organizations)
	useOrganizationsPlaybooks(organizations)
	useOrganizationsSocialMedia(organizations)
	useOrganizationsNews(organizations)
	useOrganizationsExercises(organizations)
}

func useOrganizationsIncidents(organizations fiber.Router) {
	incidentController := controller.NewIncidentController()

	incidents := organizations.Group("/:organizationId/incidents")
	incidents.Get("/", func(c *fiber.Ctx) error {
		log.Printf("GET /:organizationId/incidents called")
		return incidentController.GetIncidents(c)
	})
	incidentsWithId := incidents.Group("/:incidentId")
	incidentsWithId.Get("/", func(c *fiber.Ctx) error {
		log.Printf("GET /:organizationId/incidents/:incidentId called")
		return incidentController.GetIncident(c)
	})
	incidentsWithId.Get("/graph", func(c *fiber.Ctx) error {
		log.Printf("GET /:organizationId/incidents/:incidentId/graph called")
		return incidentController.GetIncidentGraph(c)
	})
	incidentsWithId.Get("/table", func(c *fiber.Ctx) error {
		log.Printf("GET /:organizationId/incidents/:incidentId/table called")
		return incidentController.GetIncidentTable(c)
	})
	incidentsWithId.Get("/text_box", func(c *fiber.Ctx) error {
		log.Printf("GET /:organizationId/incidents/:incidentId/text_box called")
		return incidentController.GetIncidentTextBox(c)
	})
}

func useOrganizationsPolicies(organizations fiber.Router) {
	policyController := controller.NewPolicyController()

	policies := organizations.Group("/:organizationId/policies")
	policies.Get("/", func(c *fiber.Ctx) error {
		log.Printf("GET /:organizationId/policies called")
		return policyController.GetPolicies(c)
	})
	policies.Post("/", func(c *fiber.Ctx) error {
		log.Printf("POST /:organizationId/policies called")
		return policyController.SavePolicy(c)
	})

	policiesWithId := policies.Group("/:policyId")
	policiesWithId.Get("/", func(c *fiber.Ctx) error {
		log.Printf("GET /:organizationId/policies/:policyId called")
		return policyController.GetPolicy(c)
	})
	policiesWithId.Get("/dos", func(c *fiber.Ctx) error {
		log.Printf("GET /:organizationId/policies/:policyId/dos called")
		return policyController.GetPolicyDos(c)
	})
	policiesWithId.Get("/donts", func(c *fiber.Ctx) error {
		log.Printf("GET /:organizationId/policies/:policyId/donts called")
		return policyController.GetPolicyDonts(c)
	})
	policiesWithId.Get("/template", func(c *fiber.Ctx) error {
		log.Printf("GET /:organizationId/policies/:policyId/template called")
		return policyController.GetPolicyTemplate(c)
	})

	noOrganizationIdPolicy := organizations.Group("/policies")
	noOrganizationIdPolicy.Put("/template", func(c *fiber.Ctx) error {
		log.Printf("PUT /policies/template called")
		return policyController.UpdatePolicyTemplate(c)
	})
}

func useOrganizationsStories(organizations fiber.Router) {
	storyController := controller.NewStoryController()

	stories := organizations.Group("/:organizationId/stories")
	stories.Get("/", func(c *fiber.Ctx) error {
		log.Printf("GET /:organizationId/stories called")
		return storyController.GetStories(c)
	})
	stories.Post("/", func(c *fiber.Ctx) error {
		log.Printf("POST /:organizationId/stories called")
		return storyController.SaveStory(c)
	})
	storiesWithId := stories.Group("/:storyId")
	storiesWithId.Get("/", func(c *fiber.Ctx) error {
		log.Printf("GET /:organizationId/stories/:storyId called")
		return storyController.GetStory(c)
	})
	storiesWithId.Get("/timeline", func(c *fiber.Ctx) error {
		log.Printf("GET /:organizationId/stories/:storyId/timeline called")
		return storyController.GetStoryTimeline(c)
	})
}

func useOrganizationsPlaybooks(organizations fiber.Router) {
	playbookController := controller.NewPlaybookController()

	playbooks := organizations.Group("/:organizationId/playbooks")
	playbooks.Get("/", func(c *fiber.Ctx) error {
		log.Printf("GET /:organizationId/playbooks called")
		return playbookController.GetPlaybooks(c)
	})
	playbooksWithId := playbooks.Group("/:playbookId")
	playbooksWithId.Get("/", func(c *fiber.Ctx) error {
		log.Printf("GET /:organizationId/playbooks/:playbookId called")
		return playbookController.GetPlaybook(c)
	})
	playbooksWithId.Get("/detail", func(c *fiber.Ctx) error {
		log.Printf("GET /:organizationId/playbooks/:playbookId/detail called")
		return playbookController.GetPlaybook(c)
	})
}

func useOrganizationsSocialMedia(organizations fiber.Router) {
	socialMediaController := controller.NewSocialMediaController()

	socialMedia := organizations.Group("/:organizationId/social_media")
	socialMedia.Get("/", func(c *fiber.Ctx) error {
		log.Printf("GET /:organizationId/social_media called")
		return socialMediaController.GetAllSocialMedia(c)
	})
	socialMediaWithId := socialMedia.Group("/:socialMediaId")
	socialMediaWithId.Get("/", func(c *fiber.Ctx) error {
		log.Printf("GET /:organizationId/social_media/:socialMediaId called")
		return socialMediaController.GetSocialMedia(c)
	})
	socialMediaWithId.Get("/posts", func(c *fiber.Ctx) error {
		log.Printf("GET /:organizationId/social_media/:socialMediaId/posts called")
		return socialMediaController.GetSocialMediaPosts(c)
	})
	socialMediaWithId.Get("/chart", func(c *fiber.Ctx) error {
		log.Printf("GET /:organizationId/social_media/:socialMediaId/chart called")
		return socialMediaController.GetSocialMediaPostsPerHashtagChart(c)
	})
}

func useOrganizationsNews(organizations fiber.Router) {
	newsController := controller.NewNewsController()

	news := organizations.Group("/:organizationId/news")
	news.Get("/", func(c *fiber.Ctx) error {
		log.Printf("GET /:organizationId/news called")
		return newsController.GetAllNews(c)
	})
	newsWithId := news.Group("/:newsId")
	newsWithId.Get("/", func(c *fiber.Ctx) error {
		log.Printf("GET /:organizationId/news/:newsId called")
		return newsController.GetNews(c)
	})
}

func useOrganizationsExercises(organizations fiber.Router) {
	exerciseController := controller.NewExerciseController()

	exercise := organizations.Group("/:organizationId/exercises")
	exercise.Get("/", func(c *fiber.Ctx) error {
		log.Printf("GET /:organizationId/exercises called")
		return exerciseController.GetExercises(c)
	})
	exerciseWithId := exercise.Group("/:exerciseId")
	exerciseWithId.Get("/", func(c *fiber.Ctx) error {
		log.Printf("GET /:organizationId/exercises/:exerciseId called")
		return exerciseController.GetExercise(c)
	})
	exerciseWithId.Get("/assignment", func(c *fiber.Ctx) error {
		log.Printf("GET /:organizationId/exercises/:exerciseId/assignment called")
		return exerciseController.GetExerciseAssignment(c)
	})
}

func useEcosystem(basePath fiber.Router, context *config.Context) {
	issueRepository := context.RepositoriesMap["issues"].(*repository.IssueRepository)
	issueController := controller.NewIssueController(issueRepository)

	ecosystem := basePath.Group("/issues")
	ecosystem.Get("/", func(c *fiber.Ctx) error {
		log.Printf("GET /issues called")
		return issueController.GetIssues(c)
	})
	ecosystem.Get("/:issueId", func(c *fiber.Ctx) error {
		log.Printf("GET /issues/:issueId called")
		return issueController.GetIssue(c)
	})
	ecosystem.Post("/", func(c *fiber.Ctx) error {
		log.Printf("POST /issues called")
		return issueController.SaveIssue(c)
	})
	ecosystem.Post("/:issueId", func(c *fiber.Ctx) error {
		log.Printf("POST /issues/:issueId called")
		return issueController.UpdateIssue(c)
	})
	ecosystem.Delete("/:issueId", func(c *fiber.Ctx) error {
		log.Printf("DELETE /issues/:issueId called")
		return issueController.DeleteIssue(c)
	})
}

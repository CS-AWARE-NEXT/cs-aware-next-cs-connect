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
	organizations := basePath.Group("/organizations")
	organizations.Get("/", func(c *fiber.Ctx) error {
		log.Printf("GET /organizations called")
		return controller.GetOrganizations(c)
	})
	organizations.Get("/no_page", func(c *fiber.Ctx) error {
		log.Printf("GET /organizations/no_page called")
		return controller.GetOrganizationsNoPage(c)
	})
	organizations.Get("/:organizationId", func(c *fiber.Ctx) error {
		log.Printf("GET /organizations/:organizationId called")
		return controller.GetOrganization(c)
	})
	useOrganizationsIncidents(organizations)
	useOrganizationsStories(organizations)
	useOrganizationsPolicies(organizations)
	useOrganizationsPlaybooks(organizations)
	useOrganizationsSocialMedia(organizations)
	useOrganizationsExercises(organizations)
}

func useOrganizationsIncidents(organizations fiber.Router) {
	incidents := organizations.Group("/:organizationId/incidents")
	incidents.Get("/", func(c *fiber.Ctx) error {
		log.Printf("GET /:organizationId/incidents called")
		return controller.GetIncidents(c)
	})
	incidentsWithId := incidents.Group("/:incidentId")
	incidentsWithId.Get("/", func(c *fiber.Ctx) error {
		log.Printf("GET /:organizationId/incidents/:incidentId called")
		return controller.GetIncident(c)
	})
	incidentsWithId.Get("/graph", func(c *fiber.Ctx) error {
		log.Printf("GET /:organizationId/incidents/:incidentId/graph called")
		return controller.GetIncidentGraph(c)
	})
	incidentsWithId.Get("/table", func(c *fiber.Ctx) error {
		log.Printf("GET /:organizationId/incidents/:incidentId/table called")
		return controller.GetIncidentTable(c)
	})
	incidentsWithId.Get("/text_box", func(c *fiber.Ctx) error {
		log.Printf("GET /:organizationId/incidents/:incidentId/text_box called")
		return controller.GetIncidentTextBox(c)
	})
}

func useOrganizationsPolicies(organizations fiber.Router) {
	policies := organizations.Group("/:organizationId/policies")
	policies.Get("/", func(c *fiber.Ctx) error {
		log.Printf("GET /:organizationId/policies called")
		return controller.GetPolicies(c)
	})
	policiesWithId := policies.Group("/:policyId")
	policiesWithId.Get("/", func(c *fiber.Ctx) error {
		log.Printf("GET /:organizationId/policies/:policyId called")
		return controller.GetPolicy(c)
	})
	policiesWithId.Get("/dos", func(c *fiber.Ctx) error {
		log.Printf("GET /:organizationId/policies/:policyId/dos called")
		return controller.GetPolicyDos(c)
	})
	policiesWithId.Get("/donts", func(c *fiber.Ctx) error {
		log.Printf("GET /:organizationId/policies/:policyId/donts called")
		return controller.GetPolicyDonts(c)
	})
}

func useOrganizationsStories(organizations fiber.Router) {
	stories := organizations.Group("/:organizationId/stories")
	stories.Get("/", func(c *fiber.Ctx) error {
		log.Printf("GET /:organizationId/stories called")
		return controller.GetStories(c)
	})
	stories.Post("/", func(c *fiber.Ctx) error {
		log.Printf("POST /:organizationId/stories called")
		return controller.SaveStory(c)
	})
	storiesWithId := stories.Group("/:storyId")
	storiesWithId.Get("/", func(c *fiber.Ctx) error {
		log.Printf("GET /:organizationId/stories/:storyId called")
		return controller.GetStory(c)
	})
	storiesWithId.Get("/timeline", func(c *fiber.Ctx) error {
		log.Printf("GET /:organizationId/stories/:storyId/timeline called")
		return controller.GetStoryTimeline(c)
	})
}

func useOrganizationsPlaybooks(organizations fiber.Router) {
	playbooks := organizations.Group("/:organizationId/playbooks")
	playbooks.Get("/", func(c *fiber.Ctx) error {
		log.Printf("GET /:organizationId/playbooks called")
		return controller.GetPlaybooks(c)
	})
	playbooksWithId := playbooks.Group("/:playbookId")
	playbooksWithId.Get("/", func(c *fiber.Ctx) error {
		log.Printf("GET /:organizationId/playbooks/:playbookId called")
		return controller.GetPlaybook(c)
	})
	playbooksWithId.Get("/detail", func(c *fiber.Ctx) error {
		log.Printf("GET /:organizationId/playbooks/:playbookId/detail called")
		return controller.GetPlaybook(c)
	})
}

func useOrganizationsSocialMedia(organizations fiber.Router) {
	socialMedia := organizations.Group("/:organizationId/social_media")
	socialMedia.Get("/", func(c *fiber.Ctx) error {
		log.Printf("GET /:organizationId/social_media called")
		return controller.GetAllSocialMedia(c)
	})
	socialMediaWithId := socialMedia.Group("/:socialMediaId")
	socialMediaWithId.Get("/", func(c *fiber.Ctx) error {
		log.Printf("GET /:organizationId/social_media/:socialMediaId called")
		return controller.GetSocialMedia(c)
	})
	socialMediaWithId.Get("/posts", func(c *fiber.Ctx) error {
		log.Printf("GET /:organizationId/social_media/:socialMediaId/posts called")
		return controller.GetSocialMediaPosts(c)
	})
	socialMediaWithId.Get("/chart", func(c *fiber.Ctx) error {
		log.Printf("GET /:organizationId/social_media/:socialMediaId/chart called")
		return controller.GetSocialMediaPostsPerHashtagChart(c)
	})
}

func useOrganizationsExercises(organizations fiber.Router) {
	exercise := organizations.Group("/:organizationId/exercises")
	exercise.Get("/", func(c *fiber.Ctx) error {
		log.Printf("GET /:organizationId/exercises called")
		return controller.GetExercises(c)
	})
	exerciseWithId := exercise.Group("/:exerciseId")
	exerciseWithId.Get("/", func(c *fiber.Ctx) error {
		log.Printf("GET /:organizationId/exercises/:exerciseId called")
		return controller.GetExercise(c)
	})
	exerciseWithId.Get("/assignment", func(c *fiber.Ctx) error {
		log.Printf("GET /:organizationId/exercises/:exerciseId/assignment called")
		return controller.GetExerciseAssignment(c)
	})
}

func useEcosystem(basePath fiber.Router, context *config.Context) {
	issueRepository := context.RepositoriesMap["issues"].(*repository.IssueRepository)
	ecosystemGraphRepository := context.RepositoriesMap["ecosystemGraph"].(*repository.EcosystemGraphRepository)
	cacheRepository := context.RepositoriesMap["cache"].(*repository.CacheRepository)
	issueController := controller.NewIssueController(issueRepository)
	ecosystemGraphController := controller.NewEcosystemGraphController(ecosystemGraphRepository, cacheRepository)

	ecosystem := basePath.Group("/issues")
	ecosystem.Get("/", func(c *fiber.Ctx) error {
		log.Printf("GET /issues called")
		return issueController.GetIssues(c)
	})
	ecosystem.Get("/ecosystem_graph", func(c *fiber.Ctx) error {
		log.Printf("GET /ecosystem_graph called")
		return ecosystemGraphController.GetEcosystemGraph(c)
	})
	ecosystem.Get("/:issueId", func(c *fiber.Ctx) error {
		log.Printf("GET /issues/:issueId called")
		return issueController.GetIssue(c)
	})
	ecosystem.Post("/", func(c *fiber.Ctx) error {
		log.Printf("POST /issues called")
		return issueController.SaveIssue(c)
	})
	ecosystem.Post("/ecosystem_graph/lock", func(c *fiber.Ctx) error {
		log.Printf("POST /ecosystem_graph/lock called")
		return ecosystemGraphController.RefreshLockEcosystemGraph(c)
	})
	ecosystem.Post("/ecosystem_graph/drop_lock", func(c *fiber.Ctx) error {
		log.Printf("POST /ecosystem_graph/drop_lock called")
		return ecosystemGraphController.DropLockEcosystemGraph(c)
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

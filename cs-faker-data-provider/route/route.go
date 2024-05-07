package route

import (
	"github.com/gofiber/fiber/v2"

	"github.com/CS-AWARE-NEXT/cs-aware-next-cs-connect/cs-faker-data-provider/config"
	"github.com/CS-AWARE-NEXT/cs-aware-next-cs-connect/cs-faker-data-provider/controller"
	"github.com/CS-AWARE-NEXT/cs-aware-next-cs-connect/cs-faker-data-provider/repository"
)

func UseRoutes(app *fiber.App, context *config.Context) {
	basePath := app.Group("/cs-data-provider")
	useOrganizations(basePath, context)
	useEcosystem(basePath, context)
}

// TODO: /organizations base routes are not used since config file was introduced
// They were used for the slash command
func useOrganizations(basePath fiber.Router, context *config.Context) {
	organizationController := controller.NewOrganizationController()

	organizations := basePath.Group("/organizations")
	organizations.Get("/", func(c *fiber.Ctx) error {
		return organizationController.GetOrganizations(c)
	})
	organizations.Get("/no_page", func(c *fiber.Ctx) error {
		return organizationController.GetOrganizationsNoPage(c)
	})
	organizations.Get("/:organizationId", func(c *fiber.Ctx) error {
		return organizationController.GetOrganization(c)
	})
	useOrganizationsIncidents(organizations)
	useOrganizationsStories(organizations)
	useOrganizationsPolicies(organizations, context)
	useOrganizationsPlaybooks(organizations)
	useOrganizationsBundles(organizations)
	useOrganizationsExpertConsultancies(organizations)
	useOrganizationsSocialMedia(organizations)
	useOrganizationsNews(organizations)
	useOrganizationsExercises(organizations)
	useOrganizationsCharts(organizations)
}

func useOrganizationsIncidents(organizations fiber.Router) {
	incidentController := controller.NewIncidentController()

	incidents := organizations.Group("/:organizationId/incidents")
	incidents.Get("/", func(c *fiber.Ctx) error {
		return incidentController.GetIncidents(c)
	})
	incidentsWithId := incidents.Group("/:incidentId")
	incidentsWithId.Get("/", func(c *fiber.Ctx) error {
		return incidentController.GetIncident(c)
	})
	incidentsWithId.Get("/graph", func(c *fiber.Ctx) error {
		return incidentController.GetIncidentGraph(c)
	})
	incidentsWithId.Get("/table", func(c *fiber.Ctx) error {
		return incidentController.GetIncidentTable(c)
	})
	incidentsWithId.Get("/text_box", func(c *fiber.Ctx) error {
		return incidentController.GetIncidentTextBox(c)
	})
}

func useOrganizationsPolicies(organizations fiber.Router, context *config.Context) {
	policyRepository := context.RepositoriesMap["policies"].(*repository.PolicyRepository)
	policyController := controller.NewPolicyController(policyRepository)

	policies := organizations.Group("/:organizationId/policies")
	policies.Get("/", func(c *fiber.Ctx) error {
		return policyController.GetPolicies(c)
	})
	policies.Post("/", func(c *fiber.Ctx) error {
		return policyController.SavePolicy(c)
	})

	policiesWithId := policies.Group("/:policyId")
	policiesWithId.Get("/", func(c *fiber.Ctx) error {
		return policyController.GetPolicy(c)
	})
	policiesWithId.Delete("/", func(c *fiber.Ctx) error {
		return policyController.DeletePolicy(c)
	})
	// policiesWithId.Get("/dos", func(c *fiber.Ctx) error {
	// 	log.Printf("GET /:organizationId/policies/:policyId/dos called")
	// 	return policyController.GetPolicyDos(c)
	// })
	// policiesWithId.Get("/donts", func(c *fiber.Ctx) error {
	// 	log.Printf("GET /:organizationId/policies/:policyId/donts called")
	// 	return policyController.GetPolicyDonts(c)
	// })
	policiesWithId.Get("/template", func(c *fiber.Ctx) error {
		return policyController.GetPolicyTemplate(c)
	})
	policiesWithId.Post("/template", func(c *fiber.Ctx) error {
		return policyController.SavePolicyTemplate(c)
	})

	noOrganizationIdPolicy := organizations.Group("/policies")
	noOrganizationIdPolicy.Put("/template", func(c *fiber.Ctx) error {
		return policyController.UpdatePolicyTemplate(c)
	})
	noOrganizationIdPolicy.Get("/ten_most_common", func(c *fiber.Ctx) error {
		return policyController.GetTenMostCommonPolicies(c)
	})
}

func useOrganizationsStories(organizations fiber.Router) {
	storyController := controller.NewStoryController()

	stories := organizations.Group("/:organizationId/stories")
	stories.Get("/", func(c *fiber.Ctx) error {
		return storyController.GetStories(c)
	})
	stories.Post("/", func(c *fiber.Ctx) error {
		return storyController.SaveStory(c)
	})
	storiesWithId := stories.Group("/:storyId")
	storiesWithId.Get("/", func(c *fiber.Ctx) error {
		return storyController.GetStory(c)
	})
	storiesWithId.Get("/timeline", func(c *fiber.Ctx) error {
		return storyController.GetStoryTimeline(c)
	})
}

func useOrganizationsPlaybooks(organizations fiber.Router) {
	playbookController := controller.NewPlaybookController()

	playbooks := organizations.Group("/:organizationId/playbooks")
	playbooks.Get("/", func(c *fiber.Ctx) error {
		return playbookController.GetPlaybooks(c)
	})
	playbooksWithId := playbooks.Group("/:playbookId")
	playbooksWithId.Get("/", func(c *fiber.Ctx) error {
		return playbookController.GetPlaybook(c)
	})
	playbooksWithId.Get("/detail", func(c *fiber.Ctx) error {
		return playbookController.GetPlaybook(c)
	})
}

func useOrganizationsBundles(organizations fiber.Router) {
	bundleController := controller.NewBundleController()

	bundles := organizations.Group("/:organizationId/bundles")
	bundles.Get("/", func(c *fiber.Ctx) error {
		return bundleController.GetBundles(c)
	})
	bundleWithId := bundles.Group("/:bundleId")
	bundleWithId.Get("/", func(c *fiber.Ctx) error {
		return bundleController.GetBundle(c)
	})
	bundleWithId.Get("/content", func(c *fiber.Ctx) error {
		return bundleController.GetBundleContent(c)
	})
}

func useOrganizationsExpertConsultancies(organizations fiber.Router) {
	expertConsultancyController := controller.NewExpertConsultancyController()

	expertConsultancies := organizations.Group("/:organizationId/expert_consultancies")
	expertConsultancies.Get("/", func(c *fiber.Ctx) error {
		return expertConsultancyController.GetExpertConsultancies(c)
	})
	expertConsultancyWithId := expertConsultancies.Group("/:expertConsultancyId")
	expertConsultancyWithId.Get("/", func(c *fiber.Ctx) error {
		return expertConsultancyController.GetExpertConsultancy(c)
	})
	expertConsultancyWithId.Get("/info", func(c *fiber.Ctx) error {
		return expertConsultancyController.GetInfo(c)
	})
}

func useOrganizationsSocialMedia(organizations fiber.Router) {
	socialMediaController := controller.NewSocialMediaController()

	socialMedia := organizations.Group("/:organizationId/social_media")
	socialMedia.Get("/", func(c *fiber.Ctx) error {
		return socialMediaController.GetAllSocialMedia(c)
	})
	socialMediaWithId := socialMedia.Group("/:socialMediaId")
	socialMediaWithId.Get("/", func(c *fiber.Ctx) error {
		return socialMediaController.GetSocialMedia(c)
	})
	socialMediaWithId.Get("/posts", func(c *fiber.Ctx) error {
		return socialMediaController.GetSocialMediaPosts(c)
	})
	socialMediaWithId.Get("/chart", func(c *fiber.Ctx) error {
		return socialMediaController.GetSocialMediaPostsPerHashtagChart(c)
	})
}

func useOrganizationsNews(organizations fiber.Router) {
	newsController := controller.NewNewsController()

	news := organizations.Group("/:organizationId/news")
	news.Get("/", func(c *fiber.Ctx) error {
		return newsController.GetAllNews(c)
	})
	newsWithId := news.Group("/:newsId")
	newsWithId.Get("/", func(c *fiber.Ctx) error {
		return newsController.GetNews(c)
	})
	newsWithId.Get("/news", func(c *fiber.Ctx) error {
		return newsController.GetNewsPosts(c)
	})
}

func useOrganizationsExercises(organizations fiber.Router) {
	exerciseController := controller.NewExerciseController()

	exercise := organizations.Group("/:organizationId/exercises")
	exercise.Get("/", func(c *fiber.Ctx) error {
		return exerciseController.GetExercises(c)
	})
	exerciseWithId := exercise.Group("/:exerciseId")
	exerciseWithId.Get("/", func(c *fiber.Ctx) error {
		return exerciseController.GetExercise(c)
	})
	exerciseWithId.Get("/assignment", func(c *fiber.Ctx) error {
		return exerciseController.GetExerciseAssignment(c)
	})
}

func useOrganizationsCharts(organizations fiber.Router) {
	chartController := controller.NewChartController()

	charts := organizations.Group("/:organizationId/charts")
	charts.Get("/", func(c *fiber.Ctx) error {
		return chartController.GetCharts(c)
	})
	chartsWithId := charts.Group("/:chartId")
	chartsWithId.Get("/", func(c *fiber.Ctx) error {
		return chartController.GetChart(c)
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
		return issueController.GetIssues(c)
	})
	ecosystem.Get("/ecosystem_graph", func(c *fiber.Ctx) error {
		return ecosystemGraphController.GetEcosystemGraph(c)
	})
	ecosystem.Get("/:issueId", func(c *fiber.Ctx) error {
		return issueController.GetIssue(c)
	})
	ecosystem.Post("/", func(c *fiber.Ctx) error {
		return issueController.SaveIssue(c)
	})
	ecosystem.Post("/ecosystem_graph/lock", func(c *fiber.Ctx) error {
		return ecosystemGraphController.RefreshLockEcosystemGraph(c)
	})
	ecosystem.Post("/ecosystem_graph/drop_lock", func(c *fiber.Ctx) error {
		return ecosystemGraphController.DropLockEcosystemGraph(c)
	})
	ecosystem.Post("/:issueId", func(c *fiber.Ctx) error {
		return issueController.UpdateIssue(c)
	})
	ecosystem.Delete("/:issueId", func(c *fiber.Ctx) error {
		return issueController.DeleteIssue(c)
	})
}

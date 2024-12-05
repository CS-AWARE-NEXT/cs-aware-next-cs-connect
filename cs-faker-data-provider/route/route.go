package route

import (
	"github.com/gofiber/fiber/v2"

	"github.com/CS-AWARE-NEXT/cs-aware-next-cs-connect/cs-faker-data-provider/config"
	"github.com/CS-AWARE-NEXT/cs-aware-next-cs-connect/cs-faker-data-provider/controller"
	"github.com/CS-AWARE-NEXT/cs-aware-next-cs-connect/cs-faker-data-provider/repository"
	"github.com/CS-AWARE-NEXT/cs-aware-next-cs-connect/cs-faker-data-provider/service"
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
	useOrganizationsIncidentsSynthethic(organizations)
	useOrganizationsStories(organizations)
	useOrganizationsPolicies(organizations, context)
	useOrganizationsPlaybooks(organizations)
	useOrganizationsBundles(organizations)
	useOrganizationsMalwares(organizations)
	useOrganizationsExpertConsultancies(organizations)
	useOrganizationsSocialMedia(organizations)
	useOrganizationsNews(organizations, context)
	useOrganizationsExercises(organizations)
	useOrganizationsCharts(organizations)
	useOrganizationsLinks(organizations, context)
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
	incidentsWithId.Get("/details", func(c *fiber.Ctx) error {
		return incidentController.GetIncidentDetails(c)
	})
}

func useOrganizationsIncidentsSynthethic(organizations fiber.Router) {
	incidentSynthethicController := controller.NewIncidentSynthethicController()

	incidentsSynthethic := organizations.Group("/:organizationId/incidents_synthethic")
	incidentsSynthethic.Get("/", func(c *fiber.Ctx) error {
		return incidentSynthethicController.GetIncidentsSynthethic(c)
	})
	incidentsSynthethicWithId := incidentsSynthethic.Group("/:incidentId")
	incidentsSynthethicWithId.Get("/", func(c *fiber.Ctx) error {
		return incidentSynthethicController.GetIncidentSynththic(c)
	})
	incidentsSynthethicWithId.Get("/graph", func(c *fiber.Ctx) error {
		return incidentSynthethicController.GetIncidentSynthethicGraph(c)
	})
	incidentsSynthethicWithId.Get("/table", func(c *fiber.Ctx) error {
		return incidentSynthethicController.GetIncidentSynthethicTable(c)
	})
	incidentsSynthethicWithId.Get("/text_box", func(c *fiber.Ctx) error {
		return incidentSynthethicController.GetIncidentSynthethicTextBox(c)
	})
}

func useOrganizationsPolicies(organizations fiber.Router, context *config.Context) {
	policyRepository := context.RepositoriesMap["policies"].(*repository.PolicyRepository)
	postRepository := context.RepositoriesMap["posts"].(*repository.PostRepository)
	authService := service.NewAuthService(context.EndpointsMap["auth"])
	policyController := controller.NewPolicyController(
		policyRepository,
		postRepository,
		authService,
		context.EndpointsMap["policyExport"],
	)

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
		return policyController.UpdatePolicyTemplate(c, context.Vars)
	})
	noOrganizationIdPolicy.Get("/ten_most_common", func(c *fiber.Ctx) error {
		return policyController.GetTenMostCommonPolicies(c)
	})
}

func useOrganizationsLinks(organizations fiber.Router, context *config.Context) {
	linkRepository := context.RepositoriesMap["links"].(*repository.LinkRepository)
	linksController := controller.NewLinkController(linkRepository)

	links := organizations.Group("/:organizationId/:parentId/links")
	links.Get("/", func(c *fiber.Ctx) error {
		return linksController.GetLinks(c)
	})
	links.Post("/", func(c *fiber.Ctx) error {
		return linksController.SaveLink(c)
	})
	links.Delete("/:linkId", func(c *fiber.Ctx) error {
		return linksController.DeleteLink(c)
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

func useOrganizationsMalwares(organizations fiber.Router) {
	malwareController := controller.NewMalwareController()

	malwares := organizations.Group("/:organizationId/malwares")
	malwares.Get("/", func(c *fiber.Ctx) error {
		return malwareController.GetMalwares(c)
	})
	malwareWithId := malwares.Group("/:malwareId")
	malwareWithId.Get("/", func(c *fiber.Ctx) error {
		return malwareController.GetMalware(c)
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

func useOrganizationsNews(organizations fiber.Router, context *config.Context) {
	newsEndpoint := context.EndpointsMap["news"]
	newsRepository := context.RepositoriesMap["news"].(*repository.NewsRepository)
	authService := service.NewAuthService(context.EndpointsMap["auth"])
	newsController := controller.NewNewsController(newsRepository, newsEndpoint, authService)

	linksRepository := context.RepositoriesMap["links"].(*repository.LinkRepository)
	linksController := controller.NewLinkController(linksRepository)

	news := organizations.Group("/:organizationId/news")

	news.Get("/:organizationId/:parentId/links", func(c *fiber.Ctx) error {
		return linksController.GetLinks(c)
	})
	news.Post("/:organizationId/:parentId/links", func(c *fiber.Ctx) error {
		return linksController.SaveLink(c)
	})
	news.Delete("/:organizationId/:parentId/links/:linkId", func(c *fiber.Ctx) error {
		return linksController.DeleteLink(c)
	})

	news.Get("/", func(c *fiber.Ctx) error {
		return newsController.GetAllNews(c)
	})
	news.Post("/", func(c *fiber.Ctx) error {
		return newsController.SaveNews(c)
	})
	newsWithId := news.Group("/:newsId")
	newsWithId.Get("/", func(c *fiber.Ctx) error {
		return newsController.GetNewsByID(c)
	})
	newsWithId.Delete("/", func(c *fiber.Ctx) error {
		return newsController.DeleteNews(c)
	})
	newsWithId.Get("/news", func(c *fiber.Ctx) error {
		return newsController.GetNewsPosts(c, context.Vars)
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
	chartsWithId.Get("/line_chart", func(c *fiber.Ctx) error {
		return chartController.GetSocialMediaPostsPerComponentLineChart(c)
	})
	chartsWithId.Get("/bar_chart", func(c *fiber.Ctx) error {
		return chartController.GetSocialMediaPostsPerComponentBarChart(c)
	})

	charts6 := organizations.Group("/:organizationId/charts6")
	charts6.Get("/", func(c *fiber.Ctx) error {
		return chartController.GetCharts6(c)
	})
	charts6WithId := charts6.Group("/:chartId")
	charts6WithId.Get("/", func(c *fiber.Ctx) error {
		return chartController.GetChart6(c)
	})
	charts6WithId.Get("/data", func(c *fiber.Ctx) error {
		return chartController.GetChart6Data(c)
	})

	charts3 := organizations.Group("/:organizationId/charts3")
	charts3.Get("/", func(c *fiber.Ctx) error {
		return chartController.GetCharts3(c)
	})
	charts3WithId := charts3.Group("/:chartId")
	charts3WithId.Get("/", func(c *fiber.Ctx) error {
		return chartController.GetChart3(c)
	})
	charts3WithId.Get("/data", func(c *fiber.Ctx) error {
		return chartController.GetChart3Data(c)
	})

	charts2 := organizations.Group("/:organizationId/charts2")
	charts2.Get("/", func(c *fiber.Ctx) error {
		return chartController.GetCharts2(c)
	})
	charts2WithId := charts2.Group("/:chartId")
	charts2WithId.Get("/", func(c *fiber.Ctx) error {
		return chartController.GetChart2(c)
	})
	charts2WithId.Get("/data", func(c *fiber.Ctx) error {
		return chartController.GetChart2Data(c)
	})

	charts1 := organizations.Group("/:organizationId/charts1")
	charts1.Get("/", func(c *fiber.Ctx) error {
		return chartController.GetCharts1(c)
	})
	charts1WithId := charts1.Group("/:chartId")
	charts1WithId.Get("/", func(c *fiber.Ctx) error {
		return chartController.GetChart1(c)
	})
	charts1WithId.Get("/data", func(c *fiber.Ctx) error {
		return chartController.GetChart1Data(c)
	})

	charts5 := organizations.Group("/:organizationId/charts5")
	charts5.Get("/", func(c *fiber.Ctx) error {
		return chartController.GetCharts5(c)
	})
	charts5WithId := charts5.Group("/:chartId")
	charts5WithId.Get("/", func(c *fiber.Ctx) error {
		return chartController.GetChart5(c)
	})
	charts5WithId.Get("/data", func(c *fiber.Ctx) error {
		return chartController.GetChart5Data(c)
	})

	charts4 := organizations.Group("/:organizationId/charts4")
	charts4.Get("/", func(c *fiber.Ctx) error {
		return chartController.GetCharts4(c)
	})
	charts4WithId := charts4.Group("/:chartId")
	charts4WithId.Get("/", func(c *fiber.Ctx) error {
		return chartController.GetChart4(c)
	})
	charts4WithId.Get("/arrives_2023", func(c *fiber.Ctx) error {
		return chartController.GetChart4Arrives2023(c)
	})
	charts4WithId.Get("/departures_2023", func(c *fiber.Ctx) error {
		return chartController.GetChart4Departures2023(c)
	})
	charts4WithId.Get("/arrives_challenge", func(c *fiber.Ctx) error {
		return chartController.GetChart4ArrivesChallenge(c)
	})
	charts4WithId.Get("/departures_challenge", func(c *fiber.Ctx) error {
		return chartController.GetChart4DeparturesChallenge(c)
	})
	charts4WithId.Get("/arrives_ecowatt", func(c *fiber.Ctx) error {
		return chartController.GetChart4ArrivesEcowatt(c)
	})
	charts4WithId.Get("/departures_ecowatt", func(c *fiber.Ctx) error {
		return chartController.GetChart4DeparturesEcowatt(c)
	})

	chartsCountryCounts := organizations.Group("/:organizationId/chartsCountryCounts")
	chartsCountryCounts.Get("/", func(c *fiber.Ctx) error {
		return chartController.GetChartsCountryCounts(c)
	})
	chartsCountryCountsWithId := chartsCountryCounts.Group("/:chartId")
	chartsCountryCountsWithId.Get("/", func(c *fiber.Ctx) error {
		return chartController.GetChartCountryCounts(c)
	})
	chartsCountryCountsWithId.Get("/data", func(c *fiber.Ctx) error {
		return chartController.GetChartCountryCountsData(c)
	})

	chartsAlliancesPerGeneration := organizations.Group("/:organizationId/chartsAlliancesPerGeneration")
	chartsAlliancesPerGeneration.Get("/", func(c *fiber.Ctx) error {
		return chartController.GetChartsAlliancesPerGeneration(c)
	})
	chartsAlliancesPerGenerationWithId := chartsAlliancesPerGeneration.Group("/:chartId")
	chartsAlliancesPerGenerationWithId.Get("/", func(c *fiber.Ctx) error {
		return chartController.GetChartAlliancesPerGeneration(c)
	})
	chartsAlliancesPerGenerationWithId.Get("/data", func(c *fiber.Ctx) error {
		return chartController.GetChartAlliancesPerGenerationData(c)
	})

	chartsUniversitiesInvolved := organizations.Group("/:organizationId/chartsUniversitiesInvolved")
	chartsUniversitiesInvolved.Get("/", func(c *fiber.Ctx) error {
		return chartController.GetChartsInvolvedUniversities(c)
	})
	chartsUniversitiesInvolvedWithId := chartsUniversitiesInvolved.Group("/:chartId")
	chartsUniversitiesInvolvedWithId.Get("/", func(c *fiber.Ctx) error {
		return chartController.GetChartInvolvedUniversities(c)
	})
	chartsUniversitiesInvolvedWithId.Get("/data", func(c *fiber.Ctx) error {
		return chartController.GetChartInvolvedUniversitiesData(c)
	})

	chartsEuropeanAlliances := organizations.Group("/:organizationId/chartsEuropeanAlliances")
	chartsEuropeanAlliances.Get("/", func(c *fiber.Ctx) error {
		return chartController.GetChartsEuropeanAlliances(c)
	})
	chartsEuropeanAlliancesWithId := chartsEuropeanAlliances.Group("/:chartId")
	chartsEuropeanAlliancesWithId.Get("/", func(c *fiber.Ctx) error {
		return chartController.GetChartEuropeanAlliances(c)
	})
	chartsEuropeanAlliancesWithId.Get("/data", func(c *fiber.Ctx) error {
		return chartController.GetChartEuropeanAlliancesData(c)
	})
}

func useEcosystem(basePath fiber.Router, context *config.Context) {
	issueRepository := context.RepositoriesMap["issues"].(*repository.IssueRepository)
	ecosystemGraphRepository := context.RepositoriesMap["ecosystemGraph"].(*repository.EcosystemGraphRepository)
	cacheRepository := context.RepositoriesMap["cache"].(*repository.CacheRepository)
	issueController := controller.NewIssueController(issueRepository)
	ecosystemGraphController := controller.NewEcosystemGraphController(ecosystemGraphRepository, cacheRepository)

	linksRepository := context.RepositoriesMap["links"].(*repository.LinkRepository)
	linksController := controller.NewLinkController(linksRepository)

	ecosystem := basePath.Group("/issues")
	ecosystem.Get("/", func(c *fiber.Ctx) error {
		return issueController.GetIssues(c)
	})
	ecosystem.Get("/:organizationId/:parentId/links", func(c *fiber.Ctx) error {
		return linksController.GetLinks(c)
	})
	ecosystem.Post("/:organizationId/:parentId/links", func(c *fiber.Ctx) error {
		return linksController.SaveLink(c)
	})
	ecosystem.Delete("/:organizationId/:parentId/links/:linkId", func(c *fiber.Ctx) error {
		return linksController.DeleteLink(c)
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

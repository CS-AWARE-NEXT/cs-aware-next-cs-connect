package controller

import (
	"github.com/CS-AWARE-NEXT/cs-aware-next-cs-connect/cs-faker-data-provider/model"
	"github.com/gofiber/fiber/v2"
)

func GetIncidents(c *fiber.Ctx) error {
	organizationId := c.Params("organizationId")

	// TODO: maybe this will become the new default
	if organizationId == "4" {
		extendedTableData := model.ExtendedPaginatedTableData{
			Columns: extendedIncidentsPaginatedTableData.Columns,
			Rows:    []model.ExtendedPaginatedTableRow{},
		}
		for _, incident := range extendedIncidentsMap[organizationId] {
			extendedTableData.Rows = append(extendedTableData.Rows, model.ExtendedPaginatedTableRow{
				State:         incident.State,
				ClosedAt:      incident.ClosedAt,
				FirstObserved: incident.FirstObserved,
				ID:            incident.ID,
				Type:          incident.Type,
				Group:         incident.Group,
				AssignedTo:    incident.AssignedTo,
				Where:         incident.Where,
				Name:          incident.Name,
				Description:   incident.Description,
			})
		}
		return c.JSON(extendedTableData)
	}
	tableData := model.PaginatedTableData{
		Columns: incidentsPaginatedTableData.Columns,
		Rows:    []model.PaginatedTableRow{},
	}
	for _, incident := range incidentsMap[organizationId] {
		tableData.Rows = append(tableData.Rows, model.PaginatedTableRow{
			ID:          incident.ID,
			Name:        incident.Name,
			Description: incident.Description,
		})
	}
	return c.JSON(tableData)
}

func GetIncident(c *fiber.Ctx) error {
	organizationId := c.Params("organizationId")
	if organizationId == "4" {
		return c.JSON(getExtendedIncidentByID(c))
	}
	return c.JSON(getIncidentByID(c))
}

func GetIncidentGraph(c *fiber.Ctx) error {
	return GetGraph(c)
}

func GetIncidentTable(c *fiber.Ctx) error {
	organizationId := c.Params("organizationId")
	incidentId := c.Params("incidentId")
	if organizationId == "4" {
		return c.JSON(model.TableData{
			Caption: extendedIncidentsTableData.Caption,
			Headers: extendedIncidentsTableData.Headers,
			Rows:    extendedIncidentsTableRowsMap[incidentId],
		})
	}
	return c.JSON(model.TableData{
		Caption: incidentsTableData.Caption,
		Headers: incidentsTableData.Headers,
		Rows:    incidentsTableRowsMap[incidentId],
	})
}

func GetIncidentTextBox(c *fiber.Ctx) error {
	incidentId := c.Params("incidentId")
	return c.JSON(fiber.Map{"text": incidentsTextBoxDataMap[incidentId]})
}

func getIncidentByID(c *fiber.Ctx) model.Incident {
	organizationId := c.Params("organizationId")
	incidentId := c.Params("incidentId")
	for _, incident := range incidentsMap[organizationId] {
		if incident.ID == incidentId {
			return incident
		}
	}
	return model.Incident{}
}

func getExtendedIncidentByID(c *fiber.Ctx) model.ExtendedIncident {
	organizationId := c.Params("organizationId")
	incidentId := c.Params("incidentId")
	for _, incident := range extendedIncidentsMap[organizationId] {
		if incident.ID == incidentId {
			return incident
		}
	}
	return model.ExtendedIncident{}
}

var incidentsMap = map[string][]model.Incident{
	"1": {
		{
			ID:          "2ce53d5c-4bd4-4f02-89cc-d5b8f551770c",
			Name:        "DoS attack 1",
			Description: "An attacker performs flooding at the HTTP level to bring down only a particular web...",
		},
		{
			ID:          "be4fcd12-cb96-40f4-96a8-4eed6b61e414",
			Name:        "Brute-force attack 4",
			Description: "In this attack, some asset (information, functionality, identity, etc.) is protected...",
		},
	},
	"2": {
		{
			ID:          "39b1441b-2b36-4cdc-a1f7-aa38c25bc13b",
			Name:        "DoS attack 2",
			Description: "Port Scanning: An adversary uses a combination of techniques to determine the...",
		},
		{
			ID:          "ac1b2a79-69ce-4e83-a6cf-203fe7af194d",
			Name:        "DoS attack 3",
			Description: "An attacker performs flooding at the HTTP level to bring down only a particular web...",
		},
	},
	"3": {
		{
			ID:          "7defe83a-acbf-4784-9bc2-eb3447a0a545",
			Name:        "Brute-force attack 5",
			Description: "In this attack, some asset (information, functionality, identity, etc.) is protected...",
		},
	},
	"6": {
		{
			ID:          "50518991-4596-450a-ae1b-9b1b485014ef",
			Name:        "Brute-force attack 6",
			Description: "In this attack, some asset (information, functionality, identity, etc.) is protected...",
		},
	},
	"7": {
		{
			ID:          "ab4e9645-55b6-447f-a4a3-d8f004d4197a",
			Name:        "Brute-force attack 7",
			Description: "In this attack, some asset (information, functionality, identity, etc.) is protected...",
		},
	},
}

var extendedIncidentsMap = map[string][]model.ExtendedIncident{
	"4": {
		{
			State:         "Ignored",
			ClosedAt:      "22/05/2023, 12:58",
			FirstObserved: "22/05/2023, 12:58",
			ID:            "some-1659864426508369921",
			Type:          "Unknown",
			Group:         "Malware",
			AssignedTo:    "kim.gammelgaard@cs-aware.com",
			Where:         "Internet, X-Board",
			Name:          "Phishing Kit Collecting Victim's IP Address",
			Description:   "Phishing Kit Collecting Victim's IP Address...",
		},
		{
			State:         "Ignored",
			ClosedAt:      "22/05/2023, 12:58",
			FirstObserved: "26/04/2023, 15:05",
			ID:            "some-1651183105397366787",
			Type:          "Unknown",
			Group:         "Network threats",
			AssignedTo:    "admin@cs-aware.com",
			Where:         "Internet, X-Board",
			Name:          "Google TAG Warns of Russian Hackers Conducting Phishing Attacks in Ukraine",
			Description:   "Google TAG Warns of Russian Hackers...",
		},
		{
			State:         "Ignored",
			ClosedAt:      "22/05/2023, 12:57",
			FirstObserved: "06/02/2019, 13:10",
			ID:            "sighting--28c5631d-696f-4b46-b7ae-e3b2731f331e",
			Type:          "Attack Pattern",
			Group:         "Network threats",
			AssignedTo:    "",
			Where:         "WAN-switch",
			Name:          "DoS attack 2",
			Description:   "Port Scanning: An adversary uses a combination of techniques to determine the...",
		},
		{
			State:         "Resolved",
			ClosedAt:      "22/05/2023, 12:57",
			FirstObserved: "10/05/2023, 14:17",
			ID:            "some-1655890426048438274",
			Type:          "Unknown",
			Group:         "Malware",
			AssignedTo:    "kim.gammelgaard@cs-aware.com",
			Where:         "Webpage (Wordpress)",
			Name:          "CVE-2023-23664 Auth contributor Stored Cross-Site Scripting XSS vulnerability in ConvertBox ConvertBox Auto Embed WordPress plugin versions",
			Description:   "CVE-2023-23664 Auth. (contributor+) Stored...",
		},
		{
			State:         "Ignored",
			ClosedAt:      "22/05/2023, 12:56",
			FirstObserved: "22/05/2023, 12:55",
			ID:            "some-1660449723898277888",
			Type:          "Unknown",
			Group:         "Malware",
			AssignedTo:    "kim.gammelgaard@cs-aware.com",
			Where:         "Internet, X-Board",
			Name:          "Weekly update is up The ABC Data Mosaic Powered by Have I Been Pwned The zip TLD and Phishing The Massive Luxottica Data Breach",
			Description:   "Weekly update is up! The ABC Data Mosaic Powered...",
		},
		{
			State:         "Ignored",
			ClosedAt:      "22/05/2023, 12:40",
			FirstObserved: "22/05/2023, 12:39",
			ID:            "some-1659895501766926337",
			Type:          "Unknown",
			Group:         "Malware",
			AssignedTo:    "kim.gammelgaard@cs-aware.com",
			Where:         "Webpage (Wordpress)",
			Name:          "Hackers target vulnerable Wordpress Elementor plugin after PoC released",
			Description:   "Hackers target vulnerable Wordpress Elementor...",
		},
		{
			State:         "Resolved",
			ClosedAt:      "30/03/2023, 14:38",
			FirstObserved: "06/02/2019, 13:10",
			ID:            "sighting--d841f515-49da-431e-9f87-74f6611d0d21",
			Type:          "Attack Pattern",
			Group:         "Network Threat",
			AssignedTo:    "",
			Where:         "VPN-Router",
			Name:          "DoS attack 3",
			Description:   "An attacker performs flooding at the HTTP leve...",
		},
		{
			State:         "Ignored",
			ClosedAt:      "08/03/2023, 14:39",
			FirstObserved: "08/03/2023, 14:36",
			ID:            "TODO",
			Type:          "Unknown",
			Group:         "",
			AssignedTo:    "",
			Where:         "",
			Name:          "unknown",
			Description:   "Not received from Data Analysis",
		},
		{
			State:         "Resolved",
			ClosedAt:      "08/03/2023, 13:22",
			FirstObserved: "06/02/2019, 13:10",
			ID:            "sighting--a6a07879-a89a-467b-9bee-65450207dc74",
			Type:          "Attack Pattern",
			Group:         "OS Threat",
			AssignedTo:    "",
			Where:         "Salary-handling",
			Name:          "Brute-force attack 4",
			Description:   "In this attack, some asset (information, functionality,...",
		},
	},
}

var incidentsTextBoxDataMap = map[string]string{
	"2ce53d5c-4bd4-4f02-89cc-d5b8f551770c": `An attacker performs flooding at the HTTP level to bring down only a particular web application rather than anything listening on a TCP/IP connection.
	This denial of service attack requires substantially fewer packets to be sent which makes DoS harder to detect.
	This is an equivalent of SYN flood in HTTP. The idea is to keep the HTTP session alive indefinitely and then repeat that hundreds of times.
	This attack targets resource depletion weaknesses in web server software.
	The web server will wait to attacker's responses on the initiated HTTP sessions while the connection threads are being exhausted.`,
	"be4fcd12-cb96-40f4-96a8-4eed6b61e414": `In this attack, some asset (information, functionality, identity, etc.) is protected by a finite secret value. The attacker attempts to gain access to this asset by using trial-and-error to exhaustively explore all the possible secret values in the hope of finding the secret (or a value that is functionally equivalent) that will unlock the asset. Examples of secrets can include, but are not limited to, passwords, encryption keys, database lookup keys, and initial values to one-way functions. The key factor in this attack is the attackers' ability to explore the possible secret space rapidly. This, in turn, is a function of the size of the secret space and the computational power the attacker is able to bring to bear on the problem. If the attacker has modest resources and the secret space is large, the challenge facing the attacker is intractable. While the defender cannot control the resources available to an attacker, they can control the size of the secret space. Creating a large secret space involves selecting one's secret from as large a field of equally likely alternative secrets as possible and ensuring that an attacker is unable to reduce the size of this field using available clues or cryptanalysis. Doing this is more difficult than it sounds since elimination of patterns (which, in turn, would provide an attacker clues that would help them reduce the space of potential secrets) is difficult to do using deterministic machines, such as computers. Assuming a finite secret space, a brute force attack will eventually succeed. The defender must rely on making sure that the time and resources necessary to do so will exceed the value of the information. For example, a secret space that will likely take hundreds of years to explore is likely safe from raw-brute force attacks.`,
	"39b1441b-2b36-4cdc-a1f7-aa38c25bc13b": `Port Scanning:
	An adversary uses a combination of techniques to determine the state of the ports on a remote target.
	Any service or application available for TCP or UDP networking will have a port open for communications over the network.
	Although common services have assigned port numbers, services and applications can run on arbitrary ports.
	Additionally, port scanning is complicated by the potential for any machine to have up to 65535 possible UDP or TCP services.
	The goal of port scanning is often broader than identifying open ports, but also give the adversary information concerning the firewall configuration.
	Depending upon the method of scanning that is used, the process can be stealthy or more obtrusive, the latter being more easily detectable due to the volume of packets involved, anomalous packet traits, or system logging.
	Typical port scanning activity involves sending probes to a range of ports and observing the responses.
	There are four types of port status that this type of attack aims to identify:
	1) Open Port: The port is open and a firewall does not block access to the port,
	2) Closed Port: The port is closed (i.e. no service resides there) and a firewall does not block access to the port,
	3) Filtered Port: A firewall or ACL rule is blocking access to the port in some manner, although the presence of a listening service on the port cannot be verified, and
	4) Unfiltered Port: A firewall or ACL rule is not blocking access to the port, although the presence of a listening service on the port cannot be verified.
	For strategic purposes it is useful for an adversary to distinguish between an open port that is protected by a filter vs. a closed port that is not protected by a filter.
	Making these fine grained distinctions is impossible with certain scan types.
	A TCP connect scan, for instance, cannot distinguish a blocked port with an active service from a closed port that is not firewalled.
	Other scan types can only detect closed ports, while others cannot detect port state at all, only the presence or absence of filters. Collecting this type of information tells the adversary which ports can be attacked directly, which must be attacked with filter evasion techniques like fragmentation, source port scans, and which ports are unprotected (i.e. not firewalled) but aren't hosting a network service.
	An adversary often combines various techniques in order to gain a more complete picture of the firewall filtering mechanisms in place for a host.
	Network Topology Mapping:
	An adversary engages in scanning activities to map network nodes, hosts, devices, and routes. Adversaries usually perform this type of network reconnaissance during the early stages of attack against an external network. Many types of scanning utilities are typically employed, including ICMP tools, network mappers, port scanners, and route testing utilities such as traceroute.`,
	"ac1b2a79-69ce-4e83-a6cf-203fe7af194d": `An attacker performs flooding at the HTTP level to bring down only a particular web application rather than anything listening on a TCP/IP connection. This denial of service attack requires substantially fewer packets to be sent which makes DoS harder to detect. This is an equivalent of SYN flood in HTTP. The idea is to keep the HTTP session alive indefinitely and then repeat that hundreds of times. This attack targets resource depletion weaknesses in web server software. ,,
	The web server will wait to attacker's responses on the initiated HTTP sessions while the connection threads are being exhausted.`,
	"7defe83a-acbf-4784-9bc2-eb3447a0a545": `In this attack, some asset (information, functionality, identity, etc.) is protected by a finite secret value. The attacker attempts to gain access to this asset by using trial-and-error to exhaustively explore all the possible secret values in the hope of finding the secret (or a value that is functionally equivalent) that will unlock the asset. Examples of secrets can include, but are not limited to, passwords, encryption keys, database lookup keys, and initial values to one-way functions. The key factor in this attack is the attackers' ability to explore the possible secret space rapidly. This, in turn, is a function of the size of the secret space and the computational power the attacker is able to bring to bear on the problem. If the attacker has modest resources and the secret space is large, the challenge facing the attacker is intractable. While the defender cannot control the resources available to an attacker, they can control the size of the secret space. Creating a large secret space involves selecting one's secret from as large a field of equally likely alternative secrets as possible and ensuring that an attacker is unable to reduce the size of this field using available clues or cryptanalysis. Doing this is more difficult than it sounds since elimination of patterns (which, in turn, would provide an attacker clues that would help them reduce the space of potential secrets) is difficult to do using deterministic machines, such as computers. Assuming a finite secret space, a brute force attack will eventually succeed. The defender must rely on making sure that the time and resources necessary to do so will exceed the value of the information. For example, a secret space that will likely take hundreds of years to explore is likely safe from raw-brute force attacks.`,
	"some-1659864426508369921":             "Phishing Kit Collecting Victim's IP Address https://t.co/Ehp1KZJnQ8 https://t.co/v1xcymlhsS",
	"some-1651183105397366787":             "Google TAG Warns of Russian Hackers Conducting Phishing Attacks in Ukraine https://t.co/tm9DKCXAq1",
	"sighting--28c5631d-696f-4b46-b7ae-e3b2731f331e": `Port Scanning:
	An adversary uses a combination of techniques to determine the state of the ports on a remote target.
	Any service or application available for TCP or UDP networking will have a port open for communications over the network.
	Although common services have assigned port numbers, services and applications can run on arbitrary ports.
	Additionally, port scanning is complicated by the potential for any machine to have up to 65535 possible UDP or TCP services.
	The goal of port scanning is often broader than identifying open ports, but also give the adversary information concerning the firewall configuration.
	Depending upon the method of scanning that is used, the process can be stealthy or more obtrusive, the latter being more easily detectable due to the volume of packets involved, anomalous packet traits, or system logging.
	Typical port scanning activity involves sending probes to a range of ports and observing the responses.
	There are four types of port status that this type of attack aims to identify:
	1) Open Port: The port is open and a firewall does not block access to the port,
	2) Closed Port: The port is closed (i.e. no service resides there) and a firewall does not block access to the port,
	3) Filtered Port: A firewall or ACL rule is blocking access to the port in some manner, although the presence of a listening service on the port cannot be verified, and
	4) Unfiltered Port: A firewall or ACL rule is not blocking access to the port, although the presence of a listening service on the port cannot be verified.
	For strategic purposes it is useful for an adversary to distinguish between an open port that is protected by a filter vs. a closed port that is not protected by a filter.
	Making these fine grained distinctions is impossible with certain scan types.
	A TCP connect scan, for instance, cannot distinguish a blocked port with an active service from a closed port that is not firewalled.
	Other scan types can only detect closed ports, while others cannot detect port state at all, only the presence or absence of filters. Collecting this type of information tells the adversary which ports can be attacked directly, which must be attacked with filter evasion techniques like fragmentation, source port scans, and which ports are unprotected (i.e. not firewalled) but aren't hosting a network service.
	An adversary often combines various techniques in order to gain a more complete picture of the firewall filtering mechanisms in place for a host.
	Network Topology Mapping:
	An adversary engages in scanning activities to map network nodes, hosts, devices, and routes. Adversaries usually perform this type of network reconnaissance during the early stages of attack against an external network. Many types of scanning utilities are typically employed, including ICMP tools, network mappers, port scanners, and route testing utilities such as traceroute.`,
	"some-1655890426048438274": "CVE-2023-23664 Auth. (contributor+) Stored Cross-Site Scripting (XSS) vulnerability in ConvertBox ConvertBox Auto Embed WordPress plugin <= 1.0.19 versions. https://t.co/UHRjgwyNLn",
	"some-1660449723898277888": "Weekly update is up! The ABC Data Mosaic Powered by Have I Been Pwned; The .zip TLD and Phishing; The Massive Luxottica Data Breach https://t.co/s5kjTY1qt1",
	"some-1659895501766926337": "Hackers target vulnerable Wordpress Elementor plugin after PoC released https://t.co/h8yvWg9tDp",
	"sighting--d841f515-49da-431e-9f87-74f6611d0d21": `An attacker performs flooding at the HTTP level to bring down only a particular web application rather than anything listening on a TCP/IP connection.
	This denial of service attack requires substantially fewer packets to be sent which makes DoS harder to detect.
	This is an equivalent of SYN flood in HTTP. The idea is to keep the HTTP session alive indefinitely and then repeat that hundreds of times.
	This attack targets resource depletion weaknesses in web server software.
	The web server will wait to attacker's responses on the initiated HTTP sessions while the connection threads are being exhausted.`,
	"TODO": "Not received from Data Analysis",
	"sighting--a6a07879-a89a-467b-9bee-65450207dc74": `In this attack, some asset (information, functionality, identity, etc.) is protected by a finite secret value. The attacker attempts to gain access to this asset by using trial-and-error to exhaustively explore all the possible secret values in the hope of finding the secret (or a value that is functionally equivalent) that will unlock the asset. Examples of secrets can include, but are not limited to, passwords, encryption keys, database lookup keys, and initial values to one-way functions. The key factor in this attack is the attackers' ability to explore the possible secret space rapidly. This, in turn, is a function of the size of the secret space and the computational power the attacker is able to bring to bear on the problem. If the attacker has modest resources and the secret space is large, the challenge facing the attacker is intractable. While the defender cannot control the resources available to an attacker, they can control the size of the secret space. Creating a large secret space involves selecting one's secret from as large a field of equally likely alternative secrets as possible and ensuring that an attacker is unable to reduce the size of this field using available clues or cryptanalysis. Doing this is more difficult than it sounds since elimination of patterns (which, in turn, would provide an attacker clues that would help them reduce the space of potential secrets) is difficult to do using deterministic machines, such as computers. Assuming a finite secret space, a brute force attack will eventually succeed. The defender must rely on making sure that the time and resources necessary to do so will exceed the value of the information. For example, a secret space that will likely take hundreds of years to explore is likely safe from raw-brute force attacks.`,
	"50518991-4596-450a-ae1b-9b1b485014ef":           `In this attack, some asset (information, functionality, identity, etc.) is protected by a finite secret value. The attacker attempts to gain access to this asset by using trial-and-error to exhaustively explore all the possible secret values in the hope of finding the secret (or a value that is functionally equivalent) that will unlock the asset. Examples of secrets can include, but are not limited to, passwords, encryption keys, database lookup keys, and initial values to one-way functions. The key factor in this attack is the attackers' ability to explore the possible secret space rapidly. This, in turn, is a function of the size of the secret space and the computational power the attacker is able to bring to bear on the problem. If the attacker has modest resources and the secret space is large, the challenge facing the attacker is intractable. While the defender cannot control the resources available to an attacker, they can control the size of the secret space. Creating a large secret space involves selecting one's secret from as large a field of equally likely alternative secrets as possible and ensuring that an attacker is unable to reduce the size of this field using available clues or cryptanalysis. Doing this is more difficult than it sounds since elimination of patterns (which, in turn, would provide an attacker clues that would help them reduce the space of potential secrets) is difficult to do using deterministic machines, such as computers. Assuming a finite secret space, a brute force attack will eventually succeed. The defender must rely on making sure that the time and resources necessary to do so will exceed the value of the information. For example, a secret space that will likely take hundreds of years to explore is likely safe from raw-brute force attacks.`,
	"ab4e9645-55b6-447f-a4a3-d8f004d4197a":           `In this attack, some asset (information, functionality, identity, etc.) is protected by a finite secret value. The attacker attempts to gain access to this asset by using trial-and-error to exhaustively explore all the possible secret values in the hope of finding the secret (or a value that is functionally equivalent) that will unlock the asset. Examples of secrets can include, but are not limited to, passwords, encryption keys, database lookup keys, and initial values to one-way functions. The key factor in this attack is the attackers' ability to explore the possible secret space rapidly. This, in turn, is a function of the size of the secret space and the computational power the attacker is able to bring to bear on the problem. If the attacker has modest resources and the secret space is large, the challenge facing the attacker is intractable. While the defender cannot control the resources available to an attacker, they can control the size of the secret space. Creating a large secret space involves selecting one's secret from as large a field of equally likely alternative secrets as possible and ensuring that an attacker is unable to reduce the size of this field using available clues or cryptanalysis. Doing this is more difficult than it sounds since elimination of patterns (which, in turn, would provide an attacker clues that would help them reduce the space of potential secrets) is difficult to do using deterministic machines, such as computers. Assuming a finite secret space, a brute force attack will eventually succeed. The defender must rely on making sure that the time and resources necessary to do so will exceed the value of the information. For example, a secret space that will likely take hundreds of years to explore is likely safe from raw-brute force attacks.`,
}

var incidentsTableData = model.TableData{
	Caption: "Observed Data",
	Headers: []model.TableHeader{
		{
			Dim:  4,
			Name: "Type",
		},
		{
			Dim:  8,
			Name: "Data",
		},
	},
	Rows: []model.TableRow{},
}

var incidentsTableRowsMap = map[string][]model.TableRow{
	"2ce53d5c-4bd4-4f02-89cc-d5b8f551770c": {
		{
			ID:   "18621aed-cbff-44ab-a161-a14b6ad2845e",
			Name: "software",
			Values: []model.TableValue{
				{
					Dim:   4,
					Value: "software",
				},
				{
					Dim:   8,
					Value: `name: iptables Firewall vendor: Linux version: 1.8.0`,
				},
			},
		},
		{
			ID:   "e39c3363-e5bb-466c-8615-40ef6d269731",
			Name: "ipv4-addr",
			Values: []model.TableValue{
				{
					Dim:   4,
					Value: "ipv4-addr",
				},
				{
					Dim:   8,
					Value: `value: 2.3.4.5`,
				},
			},
		},
		{
			ID:   "13e16c6e-d759-42b1-a506-973b08f65eef",
			Name: "network-traffic",
			Values: []model.TableValue{
				{
					Dim:   4,
					Value: "network-traffic",
				},
				{
					Dim:   8,
					Value: `dst_ref: 2 src_ref: 3 protocols: [tcp]`,
				},
			},
		},
	},
	"be4fcd12-cb96-40f4-96a8-4eed6b61e414": {
		{
			ID:   "66b563c8-d3c9-4681-8ef8-75f3ed88fa99",
			Name: "software",
			Values: []model.TableValue{
				{
					Dim:   4,
					Value: "software",
				},
				{
					Dim:   8,
					Value: `name: iptables Firewall vendor: Linux version: 1.8.0`,
				},
			},
		},
		{
			ID:   "abdc0471-fc07-4f29-b5de-6ed7c59747d0",
			Name: "ipv4-addr",
			Values: []model.TableValue{
				{
					Dim:   4,
					Value: "ipv4-addr",
				},
				{
					Dim:   8,
					Value: `value: 2.3.4.5`,
				},
			},
		},
		{
			ID:   "8016eb0c-c3e1-4bd2-aaad-198ad0d93bd4",
			Name: "process",
			Values: []model.TableValue{
				{
					Dim:   4,
					Value: "process",
				},
				{
					Dim:   8,
					Value: `pid: 314 name: SamS extensions: {windows-service-ext={start_type=SERVICE_AUTO_START, display_name=Security Accounts Manager, service_name=SamS, service_type=SERVICE_WIN32_SHARE_PROCESS , service_status=SERVICE_RUNNING}}`,
				},
			},
		},
	},
	"39b1441b-2b36-4cdc-a1f7-aa38c25bc13b": {
		{
			ID:   "8d562cbe-d3a5-4f6b-82a8-631bc055f58b",
			Name: "ipv4-addr",
			Values: []model.TableValue{
				{
					Dim:   4,
					Value: "ipv4-addr",
				},
				{
					Dim:   8,
					Value: `value: 10.10.20.10`,
				},
			},
		},
		{
			ID:   "b52e138e-4066-4045-b8ff-b86bb87ad9a9",
			Name: "network-traffic",
			Values: []model.TableValue{
				{
					Dim:   4,
					Value: "network-traffic",
				},
				{
					Dim:   8,
					Value: `dst_ref: 2 src_ref: 3 protocols: [tcp]`,
				},
			},
		},
	},
	"ac1b2a79-69ce-4e83-a6cf-203fe7af194d": {
		{
			ID:   "8ea68a25-8527-4c0d-8a25-4827f0869bc3",
			Name: "software",
			Values: []model.TableValue{
				{
					Dim:   4,
					Value: "software",
				},
				{
					Dim:   8,
					Value: `name: iptables Firewall vendor: Linux version: 1.8.0`,
				},
			},
		},
		{
			ID:   "43b94ea3-9630-4fe9-a3a6-8ad7c6fd4c59",
			Name: "ipv4-addr",
			Values: []model.TableValue{
				{
					Dim:   4,
					Value: "ipv4-addr",
				},
				{
					Dim:   8,
					Value: `value: 2.3.4.5`,
				},
			},
		},
		{
			ID:   "3dcdab7c-8dbc-4572-88f3-3d76b00cc211",
			Name: "network-traffic",
			Values: []model.TableValue{
				{
					Dim:   4,
					Value: "network-traffic",
				},
				{
					Dim:   8,
					Value: `dst_ref: 2 src_ref: 3 protocols: [tcp]`,
				},
			},
		},
	},
	"7defe83a-acbf-4784-9bc2-eb3447a0a545": {
		{
			ID:   "34adf6e4-c345-4cd3-b313-9e24412dd9b3",
			Name: "ipv4-addr",
			Values: []model.TableValue{
				{
					Dim:   4,
					Value: "ipv4-addr",
				},
				{
					Dim:   8,
					Value: `value: 10.10.20.10`,
				},
			},
		},
		{
			ID:   "0f5dda56-fe6b-4b33-a02a-9caf6bc55774",
			Name: "process",
			Values: []model.TableValue{
				{
					Dim:   4,
					Value: "process",
				},
				{
					Dim:   8,
					Value: `pid: 314 name: SamS extensions: {windows-service-ext={start_type=SERVICE_AUTO_START, display_name=Security Accounts Manager, service_name=SamS, service_type=SERVICE_WIN32_SHARE_PROCESS , service_status=SERVICE_RUNNING}}`,
				},
			},
		},
	},
}

var extendedIncidentsTableData = model.TableData{
	Caption: "History",
	Headers: []model.TableHeader{
		{
			Dim:  3,
			Name: "Time",
		},
		{
			Dim:  2,
			Name: "State",
		},
		{
			Dim:  5,
			Name: "Who",
		},
		{
			Dim:  2,
			Name: "Comment",
		},
	},
	Rows: []model.TableRow{},
}

var extendedIncidentsTableRowsMap = map[string][]model.TableRow{
	"some-1659864426508369921": {
		{
			ID:   "90a16b01-03de-4590-a6b3-7e4805146f93",
			Name: "kim.gammelgaard@cs-aware.com 22/05/2023, 12:59",
			Values: []model.TableValue{
				{
					Dim:   3,
					Value: "22/05/2023, 12:59",
				},
				{
					Dim:   2,
					Value: "Ignored",
				},
				{
					Dim:   5,
					Value: "kim.gammelgaard@cs-aware.com",
				},
				{
					Dim:   2,
					Value: "hkjh",
				},
			},
		},
		{
			ID:   "a5eb6b93-ec97-4c6b-a641-b4c993731612",
			Name: "CS-Aware 22/05/2023, 12:58",
			Values: []model.TableValue{
				{
					Dim:   3,
					Value: "22/05/2023, 12:58",
				},
				{
					Dim:   2,
					Value: "Active",
				},
				{
					Dim:   5,
					Value: "CS-Aware",
				},
				{
					Dim:   2,
					Value: "initial",
				},
			},
		},
	},
	"some-1651183105397366787": {
		{
			ID:   "1007dd95-19d4-40bb-8e3d-5521929e308e",
			Name: "kim.gammelgaard@cs-aware.com 22/05/2023, 12:58",
			Values: []model.TableValue{
				{
					Dim:   3,
					Value: "22/05/2023, 12:58",
				},
				{
					Dim:   2,
					Value: "Ignored",
				},
				{
					Dim:   5,
					Value: "kim.gammelgaard@cs-aware.com",
				},
				{
					Dim:   2,
					Value: "hkjh",
				},
			},
		},
		{
			ID:   "7772464c-507b-4ed6-8bf5-3b81bbd5b99a",
			Name: "CS-Aware 26/04/2023, 15:05",
			Values: []model.TableValue{
				{
					Dim:   3,
					Value: "26/04/2023, 15:05",
				},
				{
					Dim:   2,
					Value: "Active",
				},
				{
					Dim:   5,
					Value: "CS-Aware",
				},
				{
					Dim:   2,
					Value: "initial",
				},
			},
		},
	},
	"sighting--28c5631d-696f-4b46-b7ae-e3b2731f331e": {
		{
			ID:   "21843301-9896-405f-8e20-ec488fa9b950",
			Name: "kim.gammelgaard@cs-aware.com 22/05/2023, 12:57",
			Values: []model.TableValue{
				{
					Dim:   3,
					Value: "22/05/2023, 12:57",
				},
				{
					Dim:   2,
					Value: "Ignored",
				},
				{
					Dim:   5,
					Value: "kim.gammelgaard@cs-aware.com",
				},
				{
					Dim:   2,
					Value: "hjkhgkj",
				},
			},
		},
		{
			ID:   "d7ef632d-cc9f-40e3-9e60-31ec6d397d47",
			Name: "viewer@cs-aware.com 16/05/2023, 10:24",
			Values: []model.TableValue{
				{
					Dim:   3,
					Value: "16/05/2023, 10:24",
				},
				{
					Dim:   2,
					Value: "Active",
				},
				{
					Dim:   5,
					Value: "viewer@cs-aware.com",
				},
				{
					Dim:   2,
					Value: "uio",
				},
			},
		},
		{
			ID:   "6215d2f0-d095-45ad-af9c-9bfcca86d9f6",
			Name: "viewer@cs-aware.com 08/03/2023, 13:24",
			Values: []model.TableValue{
				{
					Dim:   3,
					Value: "08/03/2023, 13:24",
				},
				{
					Dim:   2,
					Value: "Active",
				},
				{
					Dim:   5,
					Value: "viewer@cs-aware.com",
				},
				{
					Dim:   2,
					Value: "efrs",
				},
			},
		},
		{
			ID: "857849e9-27ad-4d93-b91d-55b3ce9bc623",
			Name: "CS-Aware	23/02/2023, 13:45",
			Values: []model.TableValue{
				{
					Dim:   3,
					Value: "23/02/2023, 13:45",
				},
				{
					Dim:   2,
					Value: "Active",
				},
				{
					Dim:   5,
					Value: "CS-Aware",
				},
				{
					Dim:   2,
					Value: "efrs",
				},
			},
		},
	},
	"some-1655890426048438274": {
		{
			ID:   "a6c04865-05e5-4945-a103-000da5ace5e7",
			Name: "kim.gammelgaard@cs-aware.com 22/05/2023, 12:57",
			Values: []model.TableValue{
				{
					Dim:   3,
					Value: "22/05/2023, 12:57",
				},
				{
					Dim:   2,
					Value: "Resolved",
				},
				{
					Dim:   5,
					Value: "kim.gammelgaard@cs-aware.com",
				},
				{
					Dim:   2,
					Value: "treyugjhg",
				},
			},
		},
		{
			ID:   "6528dc38-7b3d-4389-ad90-209602bf3b89",
			Name: "CS-Aware 10/05/2023, 14:17",
			Values: []model.TableValue{
				{
					Dim:   3,
					Value: "10/05/2023, 14:17",
				},
				{
					Dim:   2,
					Value: "Active",
				},
				{
					Dim:   5,
					Value: "CS-Aware",
				},
				{
					Dim:   2,
					Value: "is our home page affected?",
				},
			},
		},
	},
	"some-1660449723898277888": {
		{
			ID:   "e7736b76-aff3-4f74-a414-aeb5c7601e15",
			Name: "kim.gammelgaard@cs-aware.com 22/05/2023, 12:58",
			Values: []model.TableValue{
				{
					Dim:   3,
					Value: "22/05/2023, 12:58",
				},
				{
					Dim:   2,
					Value: "Ignored",
				},
				{
					Dim:   5,
					Value: "kim.gammelgaard@cs-aware.com",
				},
				{
					Dim:   2,
					Value: "test",
				},
			},
		},
		{
			ID:   "ea0bb60c-4915-44c4-a7b4-63c04cc510d5",
			Name: "CS-Aware 22/05/2023, 12:55",
			Values: []model.TableValue{
				{
					Dim:   3,
					Value: "22/05/2023, 12:55",
				},
				{
					Dim:   2,
					Value: "Active",
				},
				{
					Dim:   5,
					Value: "CS-Aware",
				},
				{
					Dim:   2,
					Value: "initial",
				},
			},
		},
	},
	"some-1659895501766926337": {
		{
			ID:   "998cbc48-5e7d-4e0a-bc6f-e9223ea591d1",
			Name: "kim.gammelgaard@cs-aware.com 22/05/2023, 12:40",
			Values: []model.TableValue{
				{
					Dim:   3,
					Value: "22/05/2023, 12:40",
				},
				{
					Dim:   2,
					Value: "Ignored",
				},
				{
					Dim:   5,
					Value: "kim.gammelgaard@cs-aware.com",
				},
				{
					Dim:   2,
					Value: "not using it",
				},
			},
		},
		{
			ID:   "4bff8f89-5165-4b9f-8395-0a27de7e519b",
			Name: "CS-Aware 22/05/2023, 12:39",
			Values: []model.TableValue{
				{
					Dim:   3,
					Value: "22/05/2023, 12:39",
				},
				{
					Dim:   2,
					Value: "Active",
				},
				{
					Dim:   5,
					Value: "CS-Aware",
				},
				{
					Dim:   2,
					Value: "initial",
				},
			},
		},
	},
	"sighting--d841f515-49da-431e-9f87-74f6611d0d21": {
		{
			ID:   "33048d2a-feb6-4c51-95fb-077cb5e2dda4",
			Name: "kim.gammelgaard@cs-aware.com 30/03/2023, 14:38",
			Values: []model.TableValue{
				{
					Dim:   3,
					Value: "30/03/2023, 14:38",
				},
				{
					Dim:   2,
					Value: "Resolved",
				},
				{
					Dim:   5,
					Value: "kim.gammelgaard@cs-aware.com",
				},
				{
					Dim:   2,
					Value: "hkjhjh",
				},
			},
		},
		{
			ID:   "5ac54af0-e1fb-4d9c-9a33-235f8c810428",
			Name: "CS-Aware 08/03/2023, 14:35",
			Values: []model.TableValue{
				{
					Dim:   3,
					Value: "08/03/2023, 14:35",
				},
				{
					Dim:   2,
					Value: "Active",
				},
				{
					Dim:   5,
					Value: "CS-Aware",
				},
				{
					Dim:   2,
					Value: "initial",
				},
			},
		},
	},
	"TODO": {
		{
			ID:   "1746362a-d37c-444d-b7fd-430ee2672ef2",
			Name: "viewer@cs-aware.com 08/03/2023, 14:39",
			Values: []model.TableValue{
				{
					Dim:   3,
					Value: "08/03/2023, 14:39",
				},
				{
					Dim:   2,
					Value: "Ignored",
				},
				{
					Dim:   5,
					Value: "viewer@cs-aware.com",
				},
				{
					Dim:   2,
					Value: "guyghkj",
				},
			},
		},
		{
			ID:   "4d6f0309-92cc-4263-af80-31598fa2d879",
			Name: "viewer@cs-aware.com 08/03/2023, 14:39",
			Values: []model.TableValue{
				{
					Dim:   3,
					Value: "08/03/2023, 14:39",
				},
				{
					Dim:   2,
					Value: "Self Healing decline",
				},
				{
					Dim:   5,
					Value: "viewer@cs-aware.com",
				},
				{
					Dim:   2,
					Value: "initial",
				},
			},
		},
		{
			ID:   "467bdce7-caa3-425f-9016-a3a8e61b83b0",
			Name: "viewer@cs-aware.com 08/03/2023, 14:39",
			Values: []model.TableValue{
				{
					Dim:   3,
					Value: "08/03/2023, 14:39",
				},
				{
					Dim:   2,
					Value: "Self Healing needs descision",
				},
				{
					Dim:   5,
					Value: "viewer@cs-aware.com",
				},
				{
					Dim:   2,
					Value: "initial",
				},
			},
		},
		{
			ID:   "5bdcee9a-b3dd-4cf9-b644-40453d4e196e",
			Name: "CS-Aware Self Healing 08/03/2023, 14:38",
			Values: []model.TableValue{
				{
					Dim:   3,
					Value: "08/03/2023, 14:38",
				},
				{
					Dim:   2,
					Value: "Self Healing needs descision",
				},
				{
					Dim:   5,
					Value: "CS-Aware Self Healing",
				},
				{
					Dim:   2,
					Value: "CS-AWARE SIMULATION: Download and apply the update packages found in the following link: https://access.redhat.com/errata/RHSA-2015:1462",
				},
			},
		},
		{
			ID:   "d21208a3-86f9-4763-a87a-cbd1a4a4fea2",
			Name: "viewer@cs-aware.com 08/03/2023, 14:37",
			Values: []model.TableValue{
				{
					Dim:   3,
					Value: "08/03/2023, 14:37",
				},
				{
					Dim:   2,
					Value: "Self Healing accept",
				},
				{
					Dim:   5,
					Value: "viewer@cs-aware.com",
				},
				{
					Dim:   2,
					Value: "initial",
				},
			},
		},
		{
			ID:   "4d5e2e9e-79b5-4c27-b7ba-91b50548a424",
			Name: "CS-Aware Self Healing 08/03/2023, 14:37",
			Values: []model.TableValue{
				{
					Dim:   3,
					Value: "08/03/2023, 14:37",
				},
				{
					Dim:   2,
					Value: "Self Healing needs descision",
				},
				{
					Dim:   5,
					Value: "CS-Aware Self Healing",
				},
				{
					Dim:   2,
					Value: "CS-AWARE SIMULATION: Download and apply the update packages found in the following link: https://access.redhat.com/errata/RHSA-2015:1462",
				},
			},
		},
		{
			ID:   "9c50962d-bb88-49e1-aed0-2a4992cfdf2d",
			Name: "CS-Aware Self Healing 08/03/2023, 14:37",
			Values: []model.TableValue{
				{
					Dim:   3,
					Value: "08/03/2023, 14:37",
				},
				{
					Dim:   2,
					Value: "Self Healing needs descision",
				},
				{
					Dim:   5,
					Value: "CS-Aware Self Healing",
				},
				{
					Dim:   2,
					Value: "CS-AWARE SIMULATION: Download and apply the update packages found in the following link: https://access.redhat.com/errata/RHSA-2015:1462",
				},
			},
		},
		{
			ID:   "0595cebf-338f-4481-9bdf-acfeaab57b61",
			Name: "CS-Aware Self Healing 08/03/2023, 14:36",
			Values: []model.TableValue{
				{
					Dim:   3,
					Value: "08/03/2023, 14:36",
				},
				{
					Dim:   2,
					Value: "Self Healing needs descision",
				},
				{
					Dim:   5,
					Value: "CS-Aware Self Healing",
				},
				{
					Dim:   2,
					Value: "CS-AWARE SIMULATION: Download and apply the update packages found in the following link: https://access.redhat.com/errata/RHSA-2015:1462",
				},
			},
		},
		{
			ID:   "800e8b47-5d04-48fc-8727-67429ec7427e",
			Name: "CS-Aware 08/03/2023, 14:36",
			Values: []model.TableValue{
				{
					Dim:   3,
					Value: "08/03/2023, 14:36",
				},
				{
					Dim:   2,
					Value: "Active",
				},
				{
					Dim:   5,
					Value: "CS-Aware",
				},
				{
					Dim:   2,
					Value: "initial",
				},
			},
		},
	},
	"sighting--a6a07879-a89a-467b-9bee-65450207dc74": {
		{
			ID:   "93fc4c04-b40b-4625-bf01-e46733578d5a",
			Name: "viewer@cs-aware.com 08/03/2023, 13:22",
			Values: []model.TableValue{
				{
					Dim:   3,
					Value: "08/03/2023, 13:22",
				},
				{
					Dim:   2,
					Value: "Resolved",
				},
				{
					Dim:   5,
					Value: "viewer@cs-aware.com",
				},
				{
					Dim:   2,
					Value: "segsrgrs",
				},
			},
		},
		{
			ID:   "d4b621e8-0a38-43fc-aef6-1a44d69bcfde",
			Name: "viewer@cs-aware.com 08/03/2023, 13:21",
			Values: []model.TableValue{
				{
					Dim:   3,
					Value: "08/03/2023, 13:21",
				},
				{
					Dim:   2,
					Value: "Resolved",
				},
				{
					Dim:   5,
					Value: "viewer@cs-aware.com",
				},
				{
					Dim:   2,
					Value: "lkrngapoergnak",
				},
			},
		},
		{
			ID: "5ac63acd-6b66-4abb-a242-f60a899a65ed",
			Name: "CS-Aware	23/02/2023, 13:48",
			Values: []model.TableValue{
				{
					Dim:   3,
					Value: "23/02/2023, 13:48",
				},
				{
					Dim:   2,
					Value: "Active",
				},
				{
					Dim:   5,
					Value: "CS-Aware",
				},
				{
					Dim:   2,
					Value: "efrs",
				},
			},
		},
	},
}

var incidentsPaginatedTableData = model.PaginatedTableData{
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

var extendedIncidentsPaginatedTableData = model.PaginatedTableData{
	Columns: []model.PaginatedTableColumn{
		{
			Title: "State",
		},
		{
			Title: "Closed at",
		},
		{
			Title: "First Observed",
		},
		{
			Title: "Id",
		},
		{
			Title: "Type",
		},
		{
			Title: "Group",
		},
		{
			Title: "Assigned to",
		},
		{
			Title: "Where",
		},
		{
			Title: "Name",
		},
		{
			Title: "Description",
		},
	},
	Rows: []model.PaginatedTableRow{},
}

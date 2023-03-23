package controller

import (
	"github.com/CS-AWARE-NEXT/cs-aware-next-cs-connect/cs-faker-data-provider/model"
	"github.com/gofiber/fiber/v2"
)

func GetIncidents(c *fiber.Ctx) error {
	organizationId := c.Params("organizationId")
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
	return c.JSON(getIncidentByID(c))
}

func GetIncidentGraph(c *fiber.Ctx) error {
	return GetGraph(c)
}

func GetIncidentTable(c *fiber.Ctx) error {
	incidentId := c.Params("incidentId")
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

import React, {useContext} from 'react';
import {useLocation, useRouteMatch} from 'react-router-dom';
import qs from 'qs';

import {SectionContext} from 'src/components/rhs/rhs';
import Exercise from 'src/components/backstage/widgets/exercise/exercise';
import {useExerciseData} from 'src/hooks';
import {formatUrlWithId} from 'src/helpers';

type Props = {
    name?: string;
    url?: string;
};

const ExerciseWrapper = ({
    name = 'Exercise',
    url = '',
}: Props) => {
    const sectionContextOptions = useContext(SectionContext);
    const {params: {sectionId}} = useRouteMatch<{sectionId: string}>();
    const location = useLocation();
    const queryParams = qs.parse(location.search, {ignoreQueryPrefix: true});
    const parentIdParam = queryParams.parentId as string;

    const areSectionContextOptionsProvided = sectionContextOptions.parentId !== '' && sectionContextOptions.sectionId !== '';
    const parentId = areSectionContextOptionsProvided ? sectionContextOptions.parentId : parentIdParam;
    const sectionIdForUrl = areSectionContextOptionsProvided ? sectionContextOptions.sectionId : sectionId;

    const data = useExerciseData(formatUrlWithId(url, sectionIdForUrl));

    // const data: ExerciseAssignment = {
    //     assignment: {
    //         descriptionName: 'Case Description',
    //         descriptionParts: [
    //             'Within facility X, the accounting department uses a legacy software application and database that only runs on an obsolete operating system (OS). Running on a virtual machine (VM), this OS has been discontinued (it is no longer supported by its manufacturer) and has known security vulnerabilities. Within the accounting department, all computers have Internet access, which includes the VM that hosts the legacy OS.',
    //             'The employee uses this VM on a daily basis to perform his work. Occasionally, he also uses the VM to navigate the Internet and accidentally downloads and executes an application infected with a malware (e.g., the Conficker malware1), thus activating it.',
    //             'Using spread propagation techniques that exploit vulnerabilities in network protocols, the malware spreads into the network affecting several connected desktop computers and servers. ',
    //             'The malware creates botnets and causes an avalanche phenomenon2 (e.g., congestion of local network and servers, locking out of user accounts) that renders the IT infrastructure non-operational. ',
    //             'The organisation’s information systems exhibit slow response and high latency.',
    //             'Gradually, users cannot log on to their computers and access the information systems. ',
    //             'As the attack spreads, all staff are ordered to stop using the digitalised systems and the IT infrastructure and switch to paper-based operations.',
    //             'Responding to the attack, the IT department shuts down the whole IT infrastructure and proceeds with a clean installation of computers, resorting to backup systems to partially recover hospital records. ',
    //             'The attack’s expected recovery time is estimated to be 2 or 3 working days, depending on the number of affected assets and on the effort required to re-install the IT infrastructure.',
    //         ],
    //         attackName: 'Attack Phases',
    //         attackParts: [
    //             '1.Pre-attack: An employee uses a virtual machine with an obsolete operating system. The employee occasionally surfs the Internet using the computer’s virtual machine.',
    //             '2.Attack: The employee accidentally downloads and executes a file infected with malware. The malware propagates to several assets in the local network. The malware creates botnets, congests the local network and servers, and locks out user accounts. The organisational information systems exhibit slow response and high latency. And gradually the users cannot log on to their computers and access the organisational information systems. All staff are forced to switch to hardcopy-based operations (paper operations) in order to perform their work activities and deliver care services.',
    //             '3.Recovery: The IT department has to proceed with a clean installation of computers (resorting to backup systems to partially recover hospital records).',
    //         ],
    //         questionName: 'Assignment',
    //         questions: [
    //             '1.Incident handling: What are the specific steps necessary to resolve the issue? Include the roles of the IT-Department, IT and other management, staff. Can you make a list of (parallel) steps to take? ',
    //             '2.Risk Management: what would be the necessary policies, knowledge, information or actions that this organisation and the people mentioned need to prevent the issue from taking place at all?',
    //             '3.Could this happen in your organisation> Why/why not?',
    //             '4.What would be the potential impact if this would happen to your organisation?',
    //         ],
    //         educationName: 'Educational Material',
    //         educationMaterial: [
    //             'To be decided',
    //         ],
    //     },
    //     incidents: [
    //         {
    //             id: 'ca238fb9-a2bc-4420-9476-386c35a0e36f',
    //             name: 'System Graph',
    //             description: 'This provides an overview of the system graph for the Foggia organization',
    //             organizationId: '5',
    //         },
    //     ],
    // };

    return (
        <>
            {data &&
                <Exercise
                    data={data}
                    name={name}
                    sectionId={sectionIdForUrl}
                    parentId={parentId}
                />}
        </>
    );
};

export default ExerciseWrapper;
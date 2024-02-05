import React from 'react';

const About = () => {
    return (
        <>
            <p>
                {'CS-CONNECT is a collaboration platform based on Object-Oriented Collaboration over the Mattermost collaboration system.'}
            </p>
            <p>
                {'Collaboration is centered around objects, where every object consists of data gathered from CRUD RESTful endpoints and view(s) rendered by dedicated widgets. It is possible to move and link between discussion and objects views using an advanced '}<b>{'hyperlinking mechanism'}</b>{', which permit one to uniquely refer to a particular field of an object or to a specific part of a discussion.'}
            </p>
            <p>
                {'The platform\'s objecst are the organizations and their incidents, policies, and stories. An exception to this structure is the '}<b>{'Ecosystem'}</b>{' organization that manages issues.'}
                <ul>
                    <li><b>{'Incidents'}</b>{' represent cybersecurity incidents that occur within an organization;'}</li>
                    <li><b>{'Policies'}</b>{' serve as a means to represent cybersecurity policies and facilitate collaboration around them;'}</li>
                    <li><b>{'Stories'}</b>{' are lists of events to provide users with a way to track incidents over time;'}</li>
                    <li><b>{'Issues'}</b>{' model discussion around a set of chosen objects owned by any organization in the platform. They can include incidents, policies, or stories relevant to the issue at hand.'}</li>
                </ul>
            </p>
        </>
    );
};

export default About;

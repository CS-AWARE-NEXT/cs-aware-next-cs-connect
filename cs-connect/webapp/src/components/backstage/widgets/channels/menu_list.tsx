import {MenuListComponentProps, OptionTypeBase} from 'react-select';
import React from 'react';
import {Scrollbars} from 'react-custom-scrollbars';
import styled from 'styled-components';

const MenuList = <T extends OptionTypeBase>(props: MenuListComponentProps<T, false>) => {
    return (
        <MenuListWrapper>
            <StyledScrollbars
                autoHeight={true}
                renderThumbVertical={({style, ...thumbProps}) => <ThumbVertical {...thumbProps}/>}
            >
                {props.children}
            </StyledScrollbars>
        </MenuListWrapper>
    );
};

const MenuListWrapper = styled.div`
    background-color: var(--center-channel-bg);
    border: 1px solid rgba(var(--center-channel-color-rgb), 0.16);
    border-radius: 4px;

    max-height: 280px;
`;

const StyledScrollbars = styled(Scrollbars)`
    height: 300px;
`;

const ThumbVertical = styled.div`
    background-color: rgba(var(--center-channel-color-rgb), 0.24);
    border-radius: 2px;
    width: 4px;
    min-height: 45px;
    margin-left: -2px;
    margin-top: 6px;
`;

export default MenuList;

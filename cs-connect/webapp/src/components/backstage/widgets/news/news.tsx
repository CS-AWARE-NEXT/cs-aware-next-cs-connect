import React, {FC} from "react";

type Props = {
    data: any;
    name: string;
    parentId: string;
    sectionId: string;
};

const News: FC<Props> = () => {
    return (
        <div>
            <h1>News</h1>
        </div>
    );
};

export default News;
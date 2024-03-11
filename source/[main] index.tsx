/** @field ./example */
import "./example/test";
/** @close ./example */

import { printf } from "../__stdlib__";
import { Main, Render } from "../__stdlib__/dom";




Main(() => {
    Render(<>
        <div>
            <h1>Hello World!</h1>
        </div>
    </>);

    Render(<>
        <div>
            <h2>Second Render!</h2>
        </div>
    </>)
})
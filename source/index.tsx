import { Match, Result, printf } from "../std/std";
import { $, Main, Render } from "../std/std.dom";

Main(() => {
    console.log("Hello");

    Render(<>
        <div className="hello"></div>
    </>)

    printf($(".hello"));

    Render(
        <>
            <h1>Hello my friend!</h1>
        </>,
        $(".hello")[0]!
    )
})
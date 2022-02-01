import { togglemode } from "../OthersFunctions/cssmode";

const Home = () => {
    return (
        <div className={"Home" + togglemode()}>
            <div className={"Tytul"+ togglemode()}>Witaj na stronie bukmacherskiej</div>
            <div className={"Strona-Tytulowa"+ togglemode()}>
                <div className={"bok"+ togglemode()}>
                    <div className={"ball"+ togglemode()}>
                        <div className={"line1"+ togglemode()}></div>
                        <div className={"line2"+ togglemode()}></div>
                    </div>
                </div>
                <div className={"Tekst"+ togglemode()}>
                <div className={"bike-riding" + togglemode()}>
                <div className={"cyclist" + togglemode()}>
                    <div className={"bike"+ togglemode()}>
                        <div className={"leftTyre" + togglemode()}>
                            <div className={"spokes" + togglemode()}></div>
                        </div>
                        <div className={"rightTyre" + togglemode()}>
                            <div className={"spokes" + togglemode()}></div>
                        </div>
                        <div className={"wheel" + togglemode()}></div>
                        <div className={"pedals" + togglemode()}></div>
                        <div className={"chain" + togglemode()}></div>
                    </div>
                    <div className={"girl" + togglemode()}>
                        <div className={"top" + togglemode()}></div>
                        <div className={"rightArm" + togglemode()}></div>
                        <div className={"leftArm" + togglemode()}></div>
                        <div className={"head" + togglemode()}></div>
                        <div className={"hair" + togglemode()}></div>
                        <div className={"strap" + togglemode()}></div>
                    <div className={"trousers" + togglemode()}>
                            <div className={"leftLeg" + togglemode()}>
                                <div className={"leftcalf" + togglemode()}></div>
                            </div>
                            <div className={"rightLeg" + togglemode()}>
                                <div className={"calf" + togglemode()}></div>
                            </div>
                        </div>
                        </div> 
                    </div>
                    </div>
                </div>
                <div className={"bok"+ togglemode()}>
                    <div className={"ball"+ togglemode()}>
                        <div className={"line1"+ togglemode()}></div>
                        <div className={"line2"+ togglemode()}></div>
                    </div>
                </div>
            </div>
            <div className={"dol"+ togglemode()}>
            </div>
        </div>
    )
};

export default Home;
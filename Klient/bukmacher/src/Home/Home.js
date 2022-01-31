import { togglemode } from "./cssmode";

const Home = () => {
    return (
        <div className={"Home" + togglemode()}>
            <div className={"Tytul"+ togglemode()}>Witaj na stronie bukmacherskiej</div>
            <div className={"Strona-Tytulowa"+ togglemode()}>
                <div className={"bok"+ togglemode()}>
                </div>
                <div className={"Tekst"+ togglemode()}>
                </div>
                <div className={"bok"+ togglemode()}>
                </div>
            </div>
            <div className={"dol"+ togglemode()}>
            </div>
        </div>
    )
};

export default Home;
import ModelRender from "../components/ModelRender";

export default function ModelPage() {

    return (
        <div>
            <ModelRender movementVector={[0, 0, 0, 0]} />
        </div>
    );
}

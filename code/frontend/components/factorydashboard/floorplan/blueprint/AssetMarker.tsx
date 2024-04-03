import Image from "next/image";
import Draggable from "react-draggable";

const AssetMarker = () => (
    <Draggable>
        <div className="absolute top-0 left-0 z-10 drop-shadow-md">
            <Image
                src="/icons/floorplan/asset-marker.svg"
                width={30}
                height={30}
                alt="asset marker icon"
                className="select-none hover:cursor-grabbing"
            />
        </div>
    </Draggable>
);

export default AssetMarker;
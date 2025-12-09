// // import React from "react";

// // this component used to make background color red blur
// // as it is needed at many place so we make a component for this and use it directly


const BlurCircle = ({top="auto", left="auto", right="auto", bottom="auto"}) => {
    return (
        <div className='absolute -z-50 h-72 w-72 rounded-full bg-primary/30 blur-3xl'
        style={{top: top, left: left, right: right, bottom: bottom,
             //background: "radial-gradient(circle, rgba(202, 99, 159, 0.3) 0%, rgba(255,0,150,0) 70%)"
        }}>

        </div>
    );
}

export default BlurCircle;

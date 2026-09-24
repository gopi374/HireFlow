import ScrollVelocity from '../reactbits/ScrollVelocity '
const Scroller = () => {
    return (
        <div>
            <ScrollVelocity
                texts={['◆ Smart Hiring Platform ◆ Find Jobs']}
                velocity={100}
                className="custom-scroll-text"
                numCopies={15}
                damping={20}
                stiffness={100}
            />
        </div>
    )
}

export default Scroller
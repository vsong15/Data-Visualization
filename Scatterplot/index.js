function App(){
    const[cyclistData, setCyclistData] = React.useState([]);

    React.useEffect(() =>{
        async function fetchData(){
            const response = await fetch(
                "https://raw.githubusercontent.com/FreeCodeCamp/ProjectReferenceData/master/cyclist-data.json"
            );
            const data = await response.json();
            console.log(data);
            setCyclistData(data);
        }
        fetchData();
    },[]);

    return(
        <div>
            <Scatterplot data={cyclistData}></Scatterplot>
        </div>
    );
}

function Scatterplot ({data}){
    const [height, setHeight] = React.useState(500);
    const [width, setWidth] = React.useState(840);
    React.useEffect(() => {
        createBarChart();
    }, [data]);

    const createBarChart = () => {
        let x = d3.scaleLinear().range([0, width]);
        x.domain([
            d3.min(data, (d) => d.Year - 1),
            d3.max(data, (d) => d.Year + 1),
        ]);

        let y = d3.scaleTime().range([0, height]);
        data.forEach(function (d){
            d.Place = +d.Place;
            var parsedTime = d.Time.split(":");
            d.Time = new Date(Date.UTC(1970, 0, 1, 0, parsedTime[0], parsedTime[1]));
        });

        y.domain(d3.extent(data, (d) => d.Time));

        let timeFormat = d3.timeFormat("%M:%S");

        let xAxis = d3.axisBottom(x).tickFormat(d3.format("d"));
        let yAxis = d3.axisLeft(y).tickFormat(timeFormat);

        let div = d3
            .select("body")
            .append("div")
            .attr("class", "tooltip")
            .attr("id", "tooltip")
            .style("opacity", 0);

        let svg = d3
            .select("svg")
            .attr("width", width + 80)
            .attr("height", height + 130)
            .attr("class", "graph")
            .append("g")
            .attr("transform", "translate(" + 60 + "," + 100 + ")");

        svg
            .append("g")
            .attr("class", "x axis")
            .attr("id", "x-axis")
            .attr("transform", "translate(0," + height + ")")
            .call(xAxis)
            .append("text")
            .attr("class","x-axis-label")
            .attr("x", width)
            .attr("y", -6)
            .style("text-anchor", "end")
            .text("Year");

        svg
            .append("g")
            .attr("class", "y axis")
            .attr("id", "y-axis")
            .call(yAxis)
            .append("text")
            .attr("class","label")
            .attr("transform", "rotate(-90)")
            .attr("y", -6)
            .attr("dy",".71em")
            .style("text-anchor", "end")
            .text("Best Time (minutes)");

        svg
            .append("text")
            .attr("transform", "rotate(-90)")
            .attr("x", -160)
            .attr("y", -44)
            .style("font-size", 18)
            .text("Time in Minutes");

        svg
            .selectAll(".dot")
            .data(data)
            .enter()
            .append("circle")
            .attr("class", "dot")
            .attr("r", 6)
            .attr("cx", function(d){
                return x(d.Year);
            })
            .attr("cy", function(d){
                return y(d.Time);
            })
            .attr("data-xvalue", function(d){
                return d.Year;
            })
            .attr("data-yvalue", function(d){
                return d.Time.toISOString();
            })
            .style("fill", function (d){
                return d.Doping !== "" ? "#ff2222" : "#00FF00";
            })
            .on("mouseover", function(d){
                div.style("opacity", 0.9);
                div.attr("data-year", d.Year);
                div
                    .html(
                        d.Name +
                        ": " +
                        d.Nationality + 
                        "<br/>" +
                        "Year: " + 
                        d.Year + 
                        "<br/> Time: " +
                        timeFormat(d.Time) +
                        (d.Doping ? "<br/>" + d.Doping : "")
                    )
                .style("left", d3.event.pageX + "px")
                .style("top", d3.event.pageY - 28 + "px");
            })
            .on("mouseout", function (){
                div.style("opacity", 0);
            });

            svg
                .append("text")
                .attr("id", "title")
                .attr("x", width/2)
                .attr("y", 0)
                .attr("text-anchor", "middle")
                .style("font-size", "30px")
                .text("Doping in Professional Bicycle Racing");

            svg
                .append("text")
                .attr("x", width/2)
                .attr("y", 25)
                .attr("text-anchor", "middle")
                .style("font-size", "20px")
                .text("35 Fastest Times up Alpe d'Huez");

            let legendContainer = svg.append("g").attr("id", "legend");

            let legend = legendContainer
                .selectAll("#legend")
                .data(["#ff2222", "#00FF00"])
                .enter()
                .append("g")
                .attr("class", "legend-label")
                .attr("transform", function(d,i){
                    return "translate(0," + (height/2-i*20) + ")";
                });

            legend 
                .append("rect")
                .attr("x", width-18)
                .attr("width", 18)
                .attr("height", 18)
                .style("fill", (d) => d);

            legend
                .append('text')
                .attr("x", width - 24)
                .attr("y", 9)
                .attr("dy", ".35em")
                .style("text-anchor", "end")
                .text(function (d){
                    if(d == "#ff2222"){
                        return "Riders with doping allegations";
                    }
                    else{
                        return "No doping allegations";
                    }
                });
    };

    return (
        <>
            <svg width={width} height = {height}></svg>
        </>
    );
}

ReactDOM.render(<App />, document.getElementById("root"));
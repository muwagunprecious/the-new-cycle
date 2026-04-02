
function testMatching() {
    const userFullName = "Precious Muwagun".toLowerCase();
    const directors = [
        { firstname: "Precious", surname: "Muwagun" },
        { firstname: "John", surname: "Doe" }
    ];
    
    const isDirectorVerified = directors.some(director => {
        const dFirst = (director.firstname || "").toLowerCase();
        const dLast = (director.lastname || director.surname || "").toLowerCase();
        return (dFirst.length > 1 && userFullName.includes(dFirst)) && 
               (dLast.length > 1 && userFullName.includes(dLast));
    });
    
    console.log("Match Found (Expected True):", isDirectorVerified);
    
    const directors2 = [
        { firstname: "John", surname: "Doe" }
    ];
    const isDirectorVerified2 = directors2.some(director => {
        const dFirst = (director.firstname || "").toLowerCase();
        const dLast = (director.lastname || director.surname || "").toLowerCase();
        return (dFirst.length > 1 && userFullName.includes(dFirst)) && 
               (dLast.length > 1 && userFullName.includes(dLast));
    });
    console.log("Match Found (Expected False):", isDirectorVerified2);

    const userFullName3 = "Muwagun Precious A.".toLowerCase();
    const directors3 = [
        { first_name: "Precious", last_name: "Muwagun" }
    ];
    const isDirectorVerified3 = directors3.some(director => {
        const dFirst = (director.firstname || director.first_name || "").toLowerCase();
        const dLast = (director.lastname || director.last_name || director.surname || "").toLowerCase();
        return (dFirst.length > 1 && userFullName3.includes(dFirst)) && 
               (dLast.length > 1 && userFullName3.includes(dLast));
    });
    console.log("Match Found (Expected True with middle init):", isDirectorVerified3);
}

testMatching();

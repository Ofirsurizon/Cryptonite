
function loadAbout() {
    $('#search-form').attr("style", "display: none !important;");
    $("#container").empty();
    $("#container").html(
      
      `
      <div class="about-section">

      <h2>About Me</h2>
      <p>Hello! I'm Ofir Surizon, a cryptocurrency enthusiast based in the beautiful city of Ramle, Israel. With a strong passion for technology and finance, I decided to blend my interests and contribute to the exciting world of cryptocurrencies.</p>
        
        <h2>About Cryptonite</h2>
        <p>
          Welcome to Cryptonite, your one-stop platform for live updates and reports on your favorite cryptocurrencies.
          Founded by Ofir Surizon, a crypto enthusiast from Ramle, Israel, Cryptonite aims to provide the latest and
          most accurate data about the top cryptocurrencies in the market.
        </p>
        <p>
          The platform allows you to search for specific coins, get detailed information about them, and save a list of
          your top 5 favorites. With the live reports feature, you can keep an eye on your selected coins and watch their
          performance over time. Cryptonite's goal is to make crypto tracking easy and accessible for everyone, whether
          you're a seasoned investor or just starting out.
        </p>
        <h2>Contact Us</h2>
        <p>
          Email: <a href="mailto:ofirsuri10@gmail.com">ofirsuri10@gmail.com</a><br>
          Phone: <a href="tel:+0542086111">0542086111</a>
        </p>
      </div>
      `
    );
    
  }


$(document).ready(function() {
    $("#aboutPage").click(function(event) {
        event.preventDefault();
        loadAbout();
    });
});

$(document).ready(function() {
    $("#homePage").click(function(event) {
        event.preventDefault();
        $("#search-form").show();
        $("#container").empty(); 
        mountHomePage(); 
    });
});
let proizvodi = [
  { id: 0, naziv: "Brasno", kategorija: 0, stanje: 10, cijena: 20 },
  { id: 1, naziv: "Drvena vrata", kategorija: 3, stanje: 20, cijena: 100 },
  { id: 2, naziv: "Hlace", kategorija: 4, stanje: 8, cijena: 10 },
  { id: 3, naziv: "Elektricni sporet", kategorija: 1, stanje: 5, cijena: 350 },
  { id: 4, naziv: "Krevet", kategorija: 2, stanje: 24, cijena: 200 },
  { id: 5, naziv: "Nes kafa", kategorija: 0, stanje: 200, cijena: 0.5 },
];
const kategorije = [
  "Prehrambeni",
  "Bjela tehnika",
  "Namjestaj",
  "Stolarija",
  "Odjeca",
];

$(document).ready(function () {
  getProducts();
});
async function getProducts() {
  var dataref = firebase.database();
  var proizvodiRef = dataref.ref("proizvodi");
  const snapshot = await proizvodiRef.once("value");
  krerajListuProizvoda(snapshot.val(), kategorije);
}
function krerajListuProizvoda(proizvodi, kategorije) {
  console.log(proizvodi, "usao");
  const container = $("#proizvodiContainer");
  let html = "";
  proizvodi.map((item, index) => {
    const dodajSivuBoju = index % 2 !== 0 ? "siva-boja" : "";
    html += `<div id="proizvod-${
      item.id
    }" class='proizvod-container ${dodajSivuBoju}' ><p>${item.id}</p><p>${
      item.naziv
    }</p> <p>${kategorije[item.kategorija]}</p> <p> ${item.stanje}</p> <p>${
      item.cijena
    }KM</p> </div>`;
  });
  container.html(html);
  proizvodi.map((item, index) =>
    $("#proizvod-" + item.id).click(function () {
      urediProizvod("proizvod-", item, true);
    })
  );
  dodajProizvod();
}

function urediProizvod(sufiks, proizvod, jeEditovanje) {
  const container = $("#forma-uredjivanje");
  if (container.css("display") === "none") {
    $("#zatvori-uredjivanje").click(function () {
      container.css({ display: "none" });
    });
    container.css({ display: "flex" });
    if (jeEditovanje) {
      for (let i = 0; i < 5; i++) {
        const element = $(
          "#" + sufiks + Object.getOwnPropertyNames(proizvod)[i]
        );
        element.val(Object.values(proizvod)[i]);
        element.on("input", function () {
          console.log($(this).attr("name"), " :", $(this).val());
        });
      }
    }
    $("#potvrdi-uredjivanje").click(function () {
      var dataref = firebase.database();
      var proizvodiRef = dataref.ref("proizvodi/" + getFormData(container).id);
      proizvodiRef.set(getFormData(container)).then(function () {
        container.css({ display: "none" });
        getProducts();
      });

      console.log(getFormData(container));
    });
  }
}
function dodajProizvod() {
  const button = $("#dodajElement");
  button.click(function () {
    urediProizvod("proizvod-", {}, false);
  });
}
function getFormData($form) {
  var unindexed_array = $form.serializeArray();
  var indexed_array = {};

  $.map(unindexed_array, function (n, i) {
    indexed_array[n["name"]] = n["value"];
  });

  return indexed_array;
}

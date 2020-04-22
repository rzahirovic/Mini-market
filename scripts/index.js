const kategorije = [
  "Prehrambeni",
  "Bjela tehnika",
  "Namjestaj",
  "Stolarija",
  "Odjeca",
];
let duzinaProizvoda = 0;
let proizvodi = [];
$(document).ready(function () {
  getProducts();
  getProdajaHistory();
  $("#pretrazivanje-input").on("keyup", function () {
    var value = $(this).val().toLowerCase();
    $("#proizvodiContainer div").filter(function () {
      $(this).toggle($(this).text().toLowerCase().indexOf(value) > -1);
    });
  });
});
async function getProducts() {
  var dataref = firebase.database();
  var proizvodiRef = dataref.ref("proizvodi");
  const snapshot = await proizvodiRef.once("value");
  proizvodi = snapshot.val();
  krerajListuProizvoda(snapshot.val(), kategorije);
}
function krerajListuProizvoda(proizvodi, kategorije) {
  const container = $("#proizvodiContainer");
  let html = "";
  proizvodi &&
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
  if (proizvodi)
    proizvodi.map((item, index) =>
      $("#proizvod-" + item.id).click(function () {
        urediProizvod("proizvod-", item, true, index);
      })
    );
  dodajProizvod();
}

function urediProizvod(sufiks, proizvod, jeEditovanje, index) {
  const container = $("#forma-uredjivanje");
  const deleteButton = $("#brisanje-uredjivanje");
  const prodajButton = $("#prodaj-proizvod");
  if (!jeEditovanje) {
    deleteButton.hide();
    prodajButton.hide();
  } else {
    deleteButton.show();
    prodajButton.show();
    prodajProizvod(proizvod, container, index);
  }
  if (container.css("display") === "none") {
    $("#zatvori-uredjivanje").click(function () {
      container.css({ display: "none" });
      container.trigger("reset");
    });
    for (let i = 0; i < 5; i++) {
      const element = $("#" + sufiks + Object.getOwnPropertyNames(proizvod)[i]);
      element.val("");
    }

    container.css({ display: "flex" });
    if (jeEditovanje) {
      for (let i = 0; i < 5; i++) {
        const element = $(
          "#" + sufiks + Object.getOwnPropertyNames(proizvod)[i]
        );
        element.val(Object.values(proizvod)[i]);
      }
    }
    $("#potvrdi-uredjivanje").click(function () {
      var dataref = firebase.database();
      let duzina = 0;
      if (proizvodi) duzina = proizvodi.length;
      const sufiksZaCuvanje = jeEditovanje ? index : duzina;
      console.log(sufiksZaCuvanje, index, duzinaProizvoda);
      var proizvodiRef = dataref.ref("proizvodi/" + sufiksZaCuvanje);
      proizvodiRef.set(getFormData(container)).then(function () {
        container.css({ display: "none" });
        container.trigger("reset");
        getProducts();
      });

      console.log(getFormData(container));
    });
    deleteButton.click(function () {
      var dataref = firebase.database();
      var proizvodiRef = dataref.ref("proizvodi");
      console.log(index);
      let value = proizvodi.filter(function (item) {
        console.log("usaoooo", item, proizvod);
        return item.id !== proizvod.id;
      });
      console.log(value);
      proizvodiRef.set(value).then(function () {
        container.css({ display: "none" });
        container.trigger("reset");
        getProducts();
      });
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
let prodaja = [];

function prodajProizvod(proizvod, container, index) {
  getProdajaHistory();
  const prodajButton = $("#prodaj-proizvod");
  const modal = $("#prodajModal");
  const maxBroj = $("#max-prodaja");
  const unijetBroj = $("#broj-proizvoda");
  const potvrdiProdaju = $("#potvrdi-prodaju");
  unijetBroj.val("");
  prodajButton.click(function () {
    modal.css({ display: "flex" });
  });
  maxBroj.text("Broj proizvoda koje mozete prodati " + proizvod.stanje);
  potvrdiProdaju.click(function () {
    if (unijetBroj.val() && unijetBroj.val() < proizvod.stanje) {
      var dataref = firebase.database();
      let duzina = 0;
      console.log(prodaja);
      if (prodaja) duzina = prodaja.length;
      var prodajaRef = dataref.ref("prodaja/" + duzina);
      prodajaRef
        .set({
          naziv: proizvod.naziv,
          kolicina: unijetBroj.val(),
          datum: new Date().getTime(),
          id: proizvod.id,
        })
        .then(function () {
          let proizvodRef = dataref.ref("proizvodi/" + index);
          proizvodRef
            .set({
              ...proizvod,
              stanje: proizvod.stanje - unijetBroj.val(),
            })
            .then(function () {
              getProducts();
              getProdajaHistory();
              modal.css({ display: "none" });
              container.css({ display: "none" });
            });
        });
    }
  });
}
async function getProdajaHistory() {
  var dataref = firebase.database();
  var prodajaRef = dataref.ref("prodaja");
  let snapshot = await prodajaRef.once("value");
  prodaja = snapshot.val();
  prikaziProdaju(prodaja);
}
function prikaziProdaju(prodaja) {
  const container = $("#prodajaContainer");
  console.log("usao", prodaja);
  let html = "";
  if (prodaja) {
    prodaja.reverse().map((item, index) => {
      const dodajSivuBoju = index % 2 !== 0 ? "siva-boja" : "";
      html += `<div id="prodaja-${
        item.id
      }" class='prodaja-container ${dodajSivuBoju}' ><p>${item.id}</p><p>${
        item.naziv
      }</p> <p>${item.kolicina}</p> <p> ${moment(
        item.datum
      ).fromNow()}</p></div>`;
    });
    container.html(html);
  }
}

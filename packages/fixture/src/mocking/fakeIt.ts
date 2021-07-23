import { IDictionary } from "common-types";
import { NamedFakes } from "firemodel";
// TODO: bring in this functionality again
import { key as fbKey } from "firebase-key";
import { format } from "date-fns";
import faker from "faker";

const sequence: IDictionary<number> = {};

function getDistribution<T = any>(...distribution: Array<[number, T]>) {
  const num = Math.floor(Math.random() * 100) + 1;
  let start = 1;
  let outcome;
  const d = distribution.map((i) => {
    const [percentage, value] = i;
    const end = start + percentage - 1;
    const val = { start, end, value };
    start = start + percentage;
    return val;
  });

  d.forEach((i) => {
    if (num >= i.start && num <= i.end) {
      outcome = i.value;
      // console.log("set", num, `${start} => ${start + percentage}`);
    }
  });
  if (!outcome) {
    throw new Error(
      `The mock distribution's random number [ ${num} ] fell outside the range of probability; make sure that your percentages add up to 100 [ ${distribution
        .map((i) => i[0])
        .join(", ")} ]`
    );
  }

  return outcome;
}

export function fakeIt<T = any>(
  context: IDictionary,
  type: keyof typeof NamedFakes,
  ...rest: any[]
) {
  function getNumber(numOptions: {
    min?: number;
    max?: number;
    precision?: number;
  }) {
    return numOptions && typeof numOptions === "object"
      ? faker.random.number(numOptions)
      : faker.random.number({ min: 1, max: 100 });
  }

  /** for mocks which use a hash-based second param */
  function options(defaultValue: IDictionary = {}): IDictionary {
    return rest[0] ? { ...defaultValue, ...rest[0] } : undefined;
  }

  switch (type) {
    case "id":
    case "fbKey":
      return fbKey();
    case "String":
      return faker.lorem.words(5);
    case "number":
    case "Number":
      return getNumber(options({ min: 0, max: 1000 }));
    case "price":
      const price = options({
        symbol: "$",
        min: 1,
        max: 100,
        precision: 2,
        variableCents: false,
      });
      let cents: string;
      if (price.variableCents) {
        cents = getDistribution(
          [40, "00"],
          [30, "99"],
          [30, String(getNumber({ min: 1, max: 98 }))]
        );
        if (cents.length === 1) {
          cents = cents + "0";
        }
      }

      const priceAmt = faker.commerce.price(
        price.min,
        price.max,
        price.precision,
        price.symbol
      );

      return price.variableCents
        ? priceAmt.replace(".00", "." + cents)
        : priceAmt;
    case "Boolean":
      return Math.random() > 0.49 ? true : false;
    case "Object":
      return {};
    case "name":
      return faker.name.firstName() + " " + faker.name.lastName();
    case "firstName":
      return faker.name.firstName();
    case "lastName":
      return faker.name.lastName();
    case "company":
    case "companyName":
      return faker.company.companyName();
    case "address":
      return (
        faker.address.secondaryAddress() +
        ", " +
        faker.address.city() +
        ", " +
        faker.address.stateAbbr() +
        "  " +
        faker.address.zipCode()
      );
    case "streetAddress":
      return faker.address.streetAddress(false);
    case "fullAddress":
      return faker.address.streetAddress(true);
    case "city":
      return faker.address.city();
    case "state":
      return faker.address.state();
    case "zipCode":
      return faker.address.zipCode();
    case "stateAbbr":
      return faker.address.stateAbbr();
    case "country":
      return faker.address.country();
    case "countryCode":
      return faker.address.countryCode();
    case "latitude":
      return faker.address.latitude();
    case "longitude":
      return faker.address.longitude();
    case "coordinate":
      return {
        latitude: Number(faker.address.latitude()),
        longitude: Number(faker.address.longitude()),
      };
    /**
     * Adds a gender of "male", "female" or "other" but with more likelihood of
     * male or female.
     */
    case "gender":
      return faker.helpers.shuffle([
        "male",
        "female",
        "male",
        "female",
        "male",
        "female",
        "other",
      ]);
    case "age":
      return faker.random.number({ min: 1, max: 99 });
    case "ageChild":
      return faker.random.number({ min: 1, max: 10 });
    case "ageAdult":
      return faker.random.number({ min: 21, max: 99 });
    case "ageOlder":
      return faker.random.number({ min: 60, max: 99 });
    case "jobTitle":
      return faker.name.jobTitle;
    case "date":
    case "dateRecent":
      return faker.date.recent();
    case "dateRecentString":
      return format(faker.date.recent(), "yyyy-MM-dd");
    case "dateMiliseconds":
    case "dateRecentMiliseconds":
      return faker.date.recent().getTime();
    case "datePast":
      return faker.date.past();
    case "datePastString":
      return format(faker.date.past(), "yyyy-MM-dd");
    case "datePastMiliseconds":
      return faker.date.past().getTime();
    case "dateFuture":
      return faker.date.future();
    /** returns string based date in format of "YYYY-MM-DD" */
    case "dateFutureString":
      return format(faker.date.future(), "yyyy-MM-dd");
    case "dateFutureMiliseconds":
      return faker.date.future().getTime();
    case "dateSoon":
      return faker.date.between(
        new Date(),
        new Date(new Date().getTime() + 5 * 24 * 60 * 1000)
      );
    case "dateSoonString":
      return format(
        faker.date.between(
          new Date(),
          new Date(new Date().getTime() + 5 * 24 * 60 * 1000)
        ),
        "yyyy-MM-dd"
      );
    case "dateSoonMiliseconds":
      return faker.date
        .between(
          new Date(),
          new Date(new Date().getTime() + 5 * 24 * 60 * 1000)
        )
        .getTime();
    case "imageAvatar":
      return faker.image.avatar();
    case "imageAnimal":
      return faker.image.animals();
    case "imagePeople":
      return faker.image.people();
    case "imageNature":
      return faker.image.nature();
    case "imageTransport":
      return faker.image.transport();
    case "phoneNumber":
      return faker.phone.phoneNumber();
    case "email":
      return faker.internet.email;
    case "word":
      return faker.lorem.word();
    case "words":
      return faker.lorem.words();
    case "sentence":
      return faker.lorem.sentence();
    case "slug":
      return faker.lorem.slug();
    case "paragraph":
      return faker.lorem.paragraph();
    case "paragraphs":
      return faker.lorem.paragraphs();
    case "url":
      return faker.internet.url();
    case "uuid":
      return faker.random.uuid();
    case "random":
      return faker.random.arrayElement(rest);
    case "distribution":
      return getDistribution(...rest);

    case "sequence":
      const prop = context.property; 
      const items = rest;

      if (typeof sequence[prop] === "undefined") {
        sequence[prop] = 0;
      } else {
        if (sequence[prop] >= items.length - 1) {
          sequence[prop] = 0;
        } else {
          sequence[prop]++;
        }
      }

      return items[sequence[prop]];
    case "placeImage":
      // TODO: determine why data structure is an array of arrays
      const [width, height, imgType] = rest;
      return `https://placeimg.com/${width}/${height}/${imgType ? imgType : "all"
        }`;
    case "placeHolder":
      const [size, backgroundColor, textColor] = rest;
      let url = `https://via.placeholder.com/${size}`;
      if (backgroundColor) {
        url += `/${backgroundColor}`;
        if (textColor) {
          url += `/${textColor}`;
        }
      }
      return url;
    default:
      return faker.lorem.slug();
  }
}

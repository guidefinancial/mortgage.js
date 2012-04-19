var Mortgage = {};
Mortgage.Fixed = function Mortgage(options) {
  if(options === undefined) {
    throw "Missing required options";
  }
  // Check for required params
  var required = ['years','interest_percent','price','down_payment_percent'],
      i = 0;

  for(i = 0; i < required.length; i = i + 1) {
    var param = required[i];
    if (!options.hasOwnProperty(param)) {
      throw "Missing required parameter:  " + param;
    }
  }

  // Private Methods
  var years = function () { return options.years; },

  interest_rate = function () { return options.interest_percent / 100; },

  monthly_interest_rate = function () { return interest_rate() / 12; },

  price = function () { return options.price; },

  price_in_cents = function () { return price() * 100; },

  market_value = function () {
    var x = options.market_value !== undefined && options.market_value > 0 ? options.market_value : price();
    return x;
  },

  market_value_in_cents = function () { return market_value() * 100; },

  down_payment_percent = function () { return options.down_payment_percent; },

  down_payment_rate = function () { return down_payment_percent() / 100; },

  down_payment_in_cents = function () { return down_payment_rate() * price_in_cents(); },

  down_payment = function () { return down_payment_in_cents() / 100; },

  amount_in_cents = function () { return price_in_cents() - down_payment_in_cents(); },

  amount = function () { return amount_in_cents() / 100; },

  ltv_ratio = function () { return amount() / market_value(); },

  ltv_ratio_percent = function () { return ltv_ratio() * 100; },

  annual_taxes = function () { return options.annual_taxes; },

  annual_insurance = function () { return options.annual_insurance; },

  interest_percent = function () { return options.interest_percent; },

  interest_factor = function () {
    var i = 0;
    var factor = 0, base_rate = 1 + monthly_interest_rate(), denominator = base_rate, months = options.years * 12;
    for (i = 0; i < months; i = i + 1)
    {
      factor = factor + (1 / denominator);
      denominator *= base_rate;
    }
    return factor;
  },

  monthly_payment_in_cents = function () { return amount_in_cents() / interest_factor(); },

  monthly_payment = function () { return parseFloat((monthly_payment_in_cents() / 100).toFixed(2)); },

  annual_payment_in_cents = function () { return monthly_payment_in_cents() * 12; },

  annual_payment = function () { return monthly_payment() * 12; },

  annual_pmi = function () {
    var _annual_pmi = 0;
    if (down_payment_percent() < 20 && ltv_ratio_percent() >= 80) {
      _annual_pmi = (55 * (amount() / 100000)) * 12;
    }
    return _annual_pmi;
  },
  monthly_pmi = function () { return annual_pmi() / 12; },

  annual_debt_service = function () { return annual_payment() + annual_pmi(); },

  monthly_debt_service = function () { return annual_debt_service() / 12; },

  amortization_table = function () {
    var this_year_interest_paid = 0,
    this_year_principal_paid = 0,
    current_month = 1,
    current_year = 1,
    principal = amount(),
    monthly_term = years() * 12,
    amortizations = [];
    while (current_month <= monthly_term) {
      var amortization = {};
      amortization.this_year_interest_paid   = this_year_interest_paid;
      amortization.this_year_principal_paid  = this_year_principal_paid;
      amortization.month                     = current_month;
      amortization.year                      = current_year;
      amortization.interest_paid             = principal * monthly_interest_rate();
      amortization.principal_paid            = monthly_payment() - amortization.interest_paid;
      amortization.total_paid                = amortization.interest_paid + amortization.principal_paid;
      amortization.remaining_balance         = principal - amortization.principal_paid;
      amortization.this_year_interest_paid   = amortization.this_year_interest_paid + amortization.interest_paid;
      amortization.this_year_principal_paid  = amortization.this_year_principal_paid + amortization.principal_paid;
      amortization.total_spent_this_year     = amortization.this_year_interest_paid + amortization.this_year_principal_paid;
      if(amortizations.length > 0) {
        amortization.principal_paid_to_date = amortizations[amortizations.length - 1].principal_paid_to_date + amortization.principal_paid;
        amortization.interest_paid_to_date  = amortizations[amortizations.length - 1].interest_paid_to_date + amortization.interest_paid;
      } else {
        amortization.interest_paid_to_date   =  amortization.interest_paid;
        amortization.principal_paid_to_date  =  amortization.principal_paid;
      }
      var year_end = false;
      if(current_month % 12 === 0)  {
        year_end = true;
      } else {
        year_end = false;
      }

      if (year_end === true) {
        current_year = current_year + 1;
        this_year_interest_paid  = 0;
        this_year_principal_paid = 0;
      }
      amortizations.push(amortization);

      principal = amortization.remaining_balance;
      current_month += 1;
    }
    return amortizations;
  };

  // Public Methods
  this.years = years;
  this.price = price;
  this.down_payment_percent = down_payment_percent;
  this.down_payment = down_payment;
  this.market_value = market_value;
  this.amount = amount;
  this.interest_percent = interest_percent;
  this.annual_taxes = annual_taxes;
  this.annual_insurance = annual_insurance;
  this.monthly_payment = monthly_payment;
  this.annual_payment = annual_payment;
  this.ltv_ratio_percent = ltv_ratio_percent;
  this.annual_pmi = annual_pmi;
  this.monthly_pmi = monthly_pmi;
  this.annual_debt_service = annual_debt_service;
  this.monthly_debt_service = monthly_debt_service;
  this.amortization_table = amortization_table;
}

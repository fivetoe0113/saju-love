alter table orders
  add column email text not null default '';

create index orders_email_idx on orders (email);

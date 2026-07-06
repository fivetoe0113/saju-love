alter table orders
  add column source text not null default 'direct'
  check (source in ('direct', 'share'));

create index orders_source_idx on orders (source);

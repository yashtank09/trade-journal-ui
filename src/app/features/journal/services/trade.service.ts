import { Injectable, signal } from '@angular/core';
import { Trade } from '../models/trade.model';

@Injectable({
  providedIn: 'root'
})
export class TradeService {
  private trades = signal<Trade[]>([
    { id:1,  instrument:"NIFTY 50",    type:"LONG",  entry:24120.5, exit:24380,  qty:50,  date:"2026-02-28", time:"09:15", status:"CLOSED", netPnl:12655,  emotion:"Confident", plan:"Break of 24100 with volume",         notes:"Clean breakout, held well.",          tags:["breakout","trend"] },
    { id:2,  instrument:"BANKNIFTY",   type:"SHORT", entry:51800,   exit:51500,  qty:25,  date:"2026-02-28", time:"11:00", status:"CLOSED", netPnl:7220,   emotion:"Calm",      plan:"Rejection from resistance at 51800", notes:"Exactly as planned.",                 tags:["reversal"] },
    { id:3,  instrument:"RELIANCE",    type:"LONG",  entry:1425,    exit:1398.5, qty:100, date:"2026-02-28", time:"13:15", status:"CLOSED", netPnl:-2860,  emotion:"Anxious",   plan:"Daily breakout",                      notes:"Stopped out, trend was weak.",        tags:["loss"] },
    { id:4,  instrument:"NIFTY 50",    type:"LONG",  entry:24050,   exit:24210,  qty:50,  date:"2026-02-27", time:"09:20", status:"CLOSED", netPnl:7690,   emotion:"Confident", plan:"Gap up above 24000",                  notes:"Gap and go, clean.",                   tags:["gap-up"] },
    { id:5,  instrument:"BANKNIFTY",   type:"LONG",  entry:51200,   exit:51650,  qty:25,  date:"2026-02-27", time:"09:30", status:"CLOSED", netPnl:10960,  emotion:"Confident", plan:"Open drive continuation",            notes:"Best of the day.",                     tags:["momentum"] },
    { id:6,  instrument:"HDFC BANK",   type:"SHORT", entry:1720,    exit:1750,   qty:75,  date:"2026-02-27", time:"14:00", status:"CLOSED", netPnl:-2445,  emotion:"Frustrated","plan":"Bearish engulfing candle",         notes:"Wrong read, exited fast.",            tags:["loss"] },
    { id:7,  instrument:"NIFTY 50",    type:"SHORT", entry:24300,   exit:24100,  qty:75,  date:"2026-02-26", time:"09:45", status:"CLOSED", netPnl:14620,  emotion:"Calm",      plan:"Double top reversal",                notes:"Best trade of the week.",             tags:["reversal","top"] },
    { id:8,  instrument:"TATA MOTORS", type:"LONG",  entry:745,     exit:758,    qty:200, date:"2026-02-26", time:"10:00", status:"CLOSED", netPnl:2450,   emotion:"Patient",   plan:"52-week high breakout",             notes:"Slow but steady.",                     tags:["breakout"] },
    { id:9,  instrument:"NIFTY 50",    type:"LONG",  entry:24180,   exit:null,   qty:50,  date:"2026-03-01", time:"09:15", status:"OPEN",   netPnl:null,   emotion:"Focused",   plan:"Trend continuation",                  notes:"Still running.",                       tags:["live"] },
    { id:10, instrument:"BANKNIFTY",   type:"SHORT", entry:52100,   exit:51780,  qty:25,  date:"2026-02-25", time:"11:30", status:"CLOSED", netPnl:7740,   emotion:"Confident", plan:"Breakdown below 52150",             notes:"Clean execution.",                     tags:["breakdown"] },
  ]);

  getAllTrades() {
    return this.trades;
  }

  saveTrade(trade: Trade) {
    this.trades.update(current => {
      const existingIndex = current.findIndex(t => t.id === trade.id);
      if (existingIndex >= 0) {
        return current.map(t => t.id === trade.id ? trade : t);
      } else {
        return [trade, ...current];
      }
    });
  }
}

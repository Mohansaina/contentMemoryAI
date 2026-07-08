import { neon } from '@neondatabase/serverless';

const databaseUrl = process.env.DATABASE_URL || '';
const sql = neon(databaseUrl);

class NeonQueryBuilder {
  private tableName: string;
  private selectColumns: string = '*';
  private orderByClause: string = '';
  private limitCount: number | null = null;
  private whereClauses: { col: string; val: any; op: string }[] = [];
  private isCountOnly: boolean = false;

  constructor(tableName: string) {
    this.tableName = tableName;
  }

  select(cols: string = '*', options?: { count?: string; head?: boolean }) {
    this.selectColumns = cols;
    if (options?.count === 'exact') {
      this.isCountOnly = true;
    }
    return this;
  }

  order(col: string, options?: { ascending?: boolean }) {
    const dir = options?.ascending === false ? 'DESC' : 'ASC';
    this.orderByClause = `ORDER BY ${col} ${dir}`;
    return this;
  }

  limit(count: number) {
    this.limitCount = count;
    return this;
  }

  eq(col: string, val: any) {
    this.whereClauses.push({ col, val, op: '=' });
    return this;
  }

  async maybeSingle() {
    this.limitCount = 1;
    const { data, error } = await this.executeSelect();
    return { data: data?.[0] || null, error };
  }

  async single() {
    this.limitCount = 1;
    const { data, error } = await this.executeSelect();
    if (!data || data.length === 0) {
      return { data: null, error: error || new Error('No rows found') };
    }
    return { data: data[0], error };
  }

  private async executeSelect() {
    try {
      let query = '';
      if (this.isCountOnly) {
        query = `SELECT COUNT(*) as count FROM ${this.tableName}`;
      } else {
        query = `SELECT ${this.selectColumns} FROM ${this.tableName}`;
      }
      const params: any[] = [];
      if (this.whereClauses.length > 0) {
        const clauses = this.whereClauses.map((w, idx) => {
          params.push(w.val);
          return `${w.col} ${w.op} $${idx + 1}`;
        });
        query += ` WHERE ${clauses.join(' AND ')}`;
      }
      if (!this.isCountOnly && this.orderByClause) {
        query += ` ${this.orderByClause}`;
      }
      if (!this.isCountOnly && this.limitCount !== null) {
        query += ` LIMIT ${this.limitCount}`;
      }
      const data = await sql.query(query, params);
      if (this.isCountOnly) {
        const countVal = parseInt((data?.[0] as any)?.count || '0', 10);
        return { data: [], count: countVal, error: null };
      }
      return { data, count: data.length, error: null };
    } catch (e: any) {
      console.error('Neon Query Error:', e);
      return { data: null, count: 0, error: e };
    }
  }

  async insert(values: any) {
    try {
      const keys = Object.keys(values);
      const valPlaceholders = keys.map((_, idx) => `$${idx + 1}`).join(', ');
      const params = keys.map(k => values[k]);
      const query = `INSERT INTO ${this.tableName} (${keys.join(', ')}) VALUES (${valPlaceholders}) RETURNING *`;
      const data = await sql.query(query, params);
      return { data, error: null };
    } catch (e: any) {
      console.error('Neon Insert Error:', e);
      return { data: null, error: e };
    }
  }

  async upsert(values: any, options?: { onConflict?: string }) {
    try {
      const keys = Object.keys(values);
      const valPlaceholders = keys.map((_, idx) => `$${idx + 1}`).join(', ');
      const params = keys.map(k => values[k]);
      
      let conflictTarget = 'id';
      if (options?.onConflict) {
        conflictTarget = options.onConflict;
      } else if (this.tableName === 'integrations') {
        conflictTarget = 'user_id, provider';
      } else if (this.tableName === 'user_settings') {
        conflictTarget = 'user_id';
      }

      const updateSet = keys
        .filter(k => !conflictTarget.includes(k))
        .map(k => `${k} = EXCLUDED.${k}`)
        .join(', ');

      const query = `
        INSERT INTO ${this.tableName} (${keys.join(', ')})
        VALUES (${valPlaceholders})
        ON CONFLICT (${conflictTarget})
        DO UPDATE SET ${updateSet}
        RETURNING *
      `;
      const data = await sql.query(query, params);
      return { data, error: null };
    } catch (e: any) {
      console.error('Neon Upsert Error:', e);
      return { data: null, error: e };
    }
  }

  async update(values: any) {
    const builder = this;
    return {
      eq: async (col: string, val: any) => {
        try {
          const keys = Object.keys(values);
          const params = keys.map(k => values[k]);
          params.push(val);
          const setClause = keys.map((k, idx) => `${k} = $${idx + 1}`).join(', ');
          const query = `UPDATE ${builder.tableName} SET ${setClause} WHERE ${col} = $${params.length} RETURNING *`;
          const data = await sql.query(query, params);
          return { data, error: null };
        } catch (e: any) {
          console.error('Neon Update Error:', e);
          return { data: null, error: e };
        }
      }
    };
  }

  async delete() {
    const builder = this;
    return {
      eq: (col1: string, val1: any) => {
        return {
          eq: async (col2: string, val2: any) => {
            try {
              const query = `DELETE FROM ${builder.tableName} WHERE ${col1} = $1 AND ${col2} = $2 RETURNING *`;
              const data = await sql.query(query, [val1, val2]);
              return { data, error: null };
            } catch (e: any) {
              console.error('Neon Delete Error:', e);
              return { data: null, error: e };
            }
          }
        };
      }
    };
  }

  // To support thenable/promise direct await (for calls that don't call single/maybeSingle/etc)
  then(onfulfilled?: (value: any) => any, onrejected?: (reason: any) => any) {
    return this.executeSelect().then(onfulfilled, onrejected);
  }
}

export const supabase = {
  from: (tableName: string) => new NeonQueryBuilder(tableName),
  rpc: async (functionName: string, args: any) => {
    try {
      if (functionName === 'match_document_chunks') {
        const query = `
          SELECT * FROM match_document_chunks(
            $1::vector,
            $2::float,
            $3::int,
            $4::uuid
          )
        `;
        const vectorStr = `[${args.query_embedding.join(',')}]`;
        const data = await sql.query(query, [
          vectorStr,
          args.match_threshold,
          args.match_count,
          args.filter_user_id
        ]);
        return { data, error: null };
      }
      throw new Error(`RPC function ${functionName} not mocked`);
    } catch (e: any) {
      console.error('Neon RPC Error:', e);
      return { data: null, error: e };
    }
  }
};

export function getSupabaseServer(useServiceRole = false) {
  return supabase;
}

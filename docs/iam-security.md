# Securing Lambda with IAM — Hands-On Guide

## What Is an IAM Execution Role?

Every Lambda function needs permission to talk to other AWS services. It doesn't use your personal credentials — it assumes a **role** that AWS creates specifically for it. Think of it as a keycard: the function gets exactly the doors it needs, nothing more.

When you run `serverless deploy`, the Serverless Framework generates a CloudFormation stack that creates this role automatically based on the `iam.role.statements` block in `serverless.yml`.

---

## What This Project Creates

The `serverless.yml` declares two policy statements:

```yaml
iam:
  role:
    statements:
      - Effect: Allow
        Action:
          - dynamodb:PutItem
          - dynamodb:GetItem
          - dynamodb:UpdateItem
          - dynamodb:Query
        Resource:
          - !GetAtt UrlsTable.Arn
          - !Sub '${UrlsTable.Arn}/index/userId-index'
      - Effect: Allow
        Action:
          - dynamodb:PutItem
          - dynamodb:GetItem
        Resource:
          - !GetAtt UsersTable.Arn
```

**Why specific actions instead of `dynamodb:*`?**
The redirect handler only needs `GetItem` and `UpdateItem`. If that function were compromised, `dynamodb:*` would let an attacker delete every record. Specific actions limit the blast radius.

**Why specific resource ARNs instead of `*`?**
`!GetAtt UrlsTable.Arn` resolves to the exact ARN of the table in this stack (e.g. `arn:aws:dynamodb:us-east-1:123456789:table/shorturl-urls-dev`). A wildcard `arn:aws:dynamodb:*:*:table/*` would grant access to every DynamoDB table in your account.

**Why does the GSI need its own ARN?**
DynamoDB treats the base table and its Global Secondary Indexes as separate resource ARNs for IAM purposes. Querying the `userId-index` GSI requires the `.../index/userId-index` ARN explicitly — the base table ARN alone is not enough.

**Why does `usersTable` only have `PutItem` and `GetItem`?**
The URL handlers never touch the users table. The user service only creates (`PutItem`) and reads (`GetItem`) users — no updates, no deletes, no queries.

---

## How to View the Role in AWS Console

After `serverless deploy`:

1. Open the **AWS Console** → **IAM** → **Roles**
2. Search for `shorturl-dev` — you'll see a role like `shorturl-dev-us-east-1-lambdaRole`
3. Click the role → **Permissions** tab
4. Expand the inline policy — you'll see exactly what was generated from your `serverless.yml`

To see which functions use the role:
- **Lambda** → **Functions** → click any function → **Configuration** → **Permissions**
- The **Execution role** link takes you back to the IAM role

---

## Verifying Permissions with the AWS CLI

```bash
# Get the role name after deploy
aws iam list-roles --query "Roles[?contains(RoleName, 'shorturl')].RoleName"

# See the attached policies
aws iam list-role-policies --role-name shorturl-dev-us-east-1-lambdaRole

# Read the inline policy document
aws iam get-role-policy \
  --role-name shorturl-dev-us-east-1-lambdaRole \
  --policy-name shorturl-dev

# Simulate whether the role can perform an action (dry-run, no real call)
aws iam simulate-principal-policy \
  --policy-source-arn arn:aws:iam::YOUR_ACCOUNT_ID:role/shorturl-dev-us-east-1-lambdaRole \
  --action-names dynamodb:DeleteItem \
  --resource-arns arn:aws:dynamodb:us-east-1:YOUR_ACCOUNT_ID:table/shorturl-urls-dev
# Expected result: DENY — the role has no DeleteItem permission
```

---

## Common Mistakes to Avoid

| Mistake | Risk | Fix |
|---|---|---|
| `Action: dynamodb:*` | Attacker can drop tables | List only what you use |
| `Resource: "*"` | Access to every table in the account | Use `!GetAtt TableName.Arn` |
| Hardcoded credentials in code | Credential leak in git | Always use the execution role |
| Same role for all functions | One compromise escalates to all | Use per-function roles (see below) |
| `JWT_SECRET` in serverless.yml | Secret committed to repo | Read from `${env:JWT_SECRET}` |

---

## Per-Function IAM Roles (Next Level)

By default Serverless Framework gives every function in the service the same role. For stricter security, each function can have its own role with only its specific permissions:

```yaml
functions:
  redirectUrl:
    handler: src/functions/urls/redirect.handler
    iamRoleStatements:
      - Effect: Allow
        Action:
          - dynamodb:GetItem
          - dynamodb:UpdateItem
        Resource: !GetAtt UrlsTable.Arn
```

This requires the `serverless-iam-roles-per-function` plugin. It is the production-grade approach.

---

## Storing Secrets Securely (Production)

`JWT_SECRET` passed as an environment variable is fine for a study project. In production, use **AWS Systems Manager Parameter Store**:

```bash
# Store the secret (do this once, manually or via CI)
aws ssm put-parameter \
  --name /shorturl/prod/jwt-secret \
  --value "your-strong-secret" \
  --type SecureString

# Reference it in serverless.yml
environment:
  JWT_SECRET: ${ssm:/shorturl/${sls:stage}/jwt-secret}
```

This way the secret never touches your codebase or CI logs. Lambda fetches it at deploy time and injects it as an encrypted environment variable.

---

## Security Checklist

- [ ] No wildcards in `Action` or `Resource`
- [ ] GSI ARNs explicitly listed alongside table ARNs
- [ ] `JWT_SECRET` read from environment, never committed
- [ ] Passwords hashed with bcrypt before storage
- [ ] Auth errors return generic messages (no "user not found" vs "wrong password" distinction)
- [ ] 500 responses never leak internal error details
- [ ] CORS configured to your actual frontend origin in production (not `*`)
